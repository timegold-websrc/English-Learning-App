<template>
    <ContentWrapper>
        <div class="row" style="margin: -12px -20px">
            <div class="col-lg-12 pl-0 fn-18 mb-1 ml-2">
                <router-link to="/teacher/student" class="link-primary">学生</router-link> > 
                <span class="cursor-pointer link-primary" @click="$router.go(-1)">课程学习情况</span> > 
                <span class="cursor-pointer">详情</span>
            </div>
            <div class="col-lg-5 pl-0">
                <div class="card fn-20">
                    <div class="d-flex pt-4 pb-3 pr-4 pl-4 mb-0 border_b_2_muted fn-18">
                        <div class="mr-auto">详情</div>
                        <div v-if="sentenceData">总分：
                            <span v-if="sentenceData.marks >= 80" class="fn-success">{{sentenceData.marks}}分</span>
                            <span v-else-if="sentenceData.marks >= 60" class="fn-warning">{{sentenceData.marks}}分</span>
                            <span v-else  class="fn-danger">{{sentenceData.marks}}分</span>
                        </div>
                    </div>
                    <div v-if="sentenceData" class="card fn-20 pt-3 pb-3" style="min-height: 560px">
                        <div class="d-flex align-items-center p-2 sentence">
                            <div class="mr-auto">{{sentenceData.sentence.text}}</div>
                            <div class="ml-1" style="flex-shrink: 0">
                                <span v-if="sentenceData.marks >= 80" class="fn-success">{{sentenceData.marks}}</span>
                                <span v-else-if="sentenceData.marks >= 60" class="fn-warning">{{sentenceData.marks}}</span>
                                <span v-else  class="fn-danger">{{sentenceData.marks ? sentenceData.marks : 0}}</span>

                                <span class="ml-2"><em class="fa-x fas fa-chevron-right"></em></span>
                            </div>
                        </div>
                    </div>
                    <!-- <div v-for="(item, index) in sentence" 
                        :key="index"
                        :class="sentenceIndex == index ? 'active' : ''"
                        @click="selectSentence(index)"
                        class="d-flex p-2 sentence fn-16">
                        <div class="mr-auto">{{item.title}}</div>
                        <div class="text-right fn-18">
                            <span v-if="item.progress >= 80" class="fn-success">{{item.progress}}</span>
                            <span v-else-if="item.progress >= 60" class="fn-warning">{{item.progress}}</span>
                            <span v-else  class="fn-danger">{{item.progress}}</span>

                            <span class="ml-2"><em class="fa-x fas fa-chevron-right"></em></span>
                        </div>
                    </div> -->
                </div>
            </div>
            <div class="col-lg-7 pr-0 pl-0">
                <div class="card fn-18 p-4 text-center play-record-view">
                    <div class="text-pan border-bottom">
                        <!-- <div class="text-right">
                            <button type="button" class="btn trans_btn fn-12" @click="translation">翻译</button><br>
                        </div> -->
                        <div class="fn-24 text-center border_b_2_muted mb-2 pb-2">
                            <span v-for="(word, index) in result" 
                                :key="index"
                                :class="wrongWords.includes(word) ? 'fn-danger' : ''"
                                class="mr-2" >
                                {{word.text}}
                            </span>
                            <div v-if="isTrans" class="fn-18 text-center ">国王与乞丐</div>
                        </div>
                        
                        <div class="row ml-0 mr-0 fn-18" style="overflow:auto; height: 380px">
                            <div class="table-responsive">
                                <table class="table table-hover word-table">
                                    <thead>
                                        <tr><th>单词</th><th>标准音</th><th>自读音</th><th>发音</th><th>口音</th><th>语调</th></tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(word, index) in result" :key="index">
                                            <td :class="wrongWords.includes(word) ? 'fn-danger' : ''">{{word.text}}</td>
                                            <td><img src="img/icons/play_stand.png" alt="record" class="icon-26" @click="playAudioByWord(index, 'stand')"></td>
                                            <td><img src="img/icons/play_stand.png" alt="record" class="icon-26" @click="playAudioByWord(index, 'result')"></td>
                                            <td><img :src="'img/icons/' + (word.prono ? 'pass' : 'wrong') +'.png'" alt="record" class="icon-26"></td>
                                            <td><img :src="'img/icons/' + (word.accent ? 'pass' : 'wrong') +'.png'" alt="record" class="icon-26"></td>
                                            <td><img :src="'img/icons/' + (word.tone ? 'pass' : 'wrong') +'.png'" alt="record" class="icon-26"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 text-center d-flex flex-center">
                        <div class="align-bottom mr-5 standard-btn" @click="playStandard">
                            <img :src="'img/icons/' + standBtnIcon" class="icon-46">
                            <p class="mb-0 mt-1 fn-12">标准音</p>    
                        </div>
                        <div class="align-bottom ml-5 self-btn" @click="playSelf">
                            <img :src="'img/icons/' + selfBtnIcon" class="icon-46">
                            <p  class="mb-0 mt-1 fn-12">自读音</p>    
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </ContentWrapper>
</template>
<script>
    const _STOP_STATUS = 'start';
    const _PLAY_STATUS = 'stop';
    const _RETRY_STATUS = 'retry';

    const _SENTENCE = 0;
    const _WORD = 1;
    const _ARTICLE = 2;
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                resultID: 0,
                sentenceData: null,
                result: [],

                standStatus: _STOP_STATUS,
                selfStatus: _STOP_STATUS,
                isTrans: false,

                wrongWords: [],

                standAudio: null,
                resultAudio: null
            }
        },
        computed: {
            standBtnIcon: function(){
                if(this.standStatus == _STOP_STATUS) return 'play_stand.png';
                else return 'pause_stand.png';
            },
            selfBtnIcon: function(){
                if(this.selfStatus == _STOP_STATUS) return 'play_self.png';
                else return 'pause_self.png';
            },
        },
        mounted() {
            this.resultID = this.$route.query.id;
            
            this.initResultData();
            this.player = new Audio();
        },
        methods: {
            initResultData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/viewResultDetail/' + this.resultID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        var resData = response.data;
                        _this.sentenceData = resData;
                        _this.result = JSON.parse(resData.result);
                        console.log(_this.result);
                        _this.getAudioSource();
                        _this.classifyWords();
                        // console.log(_this.sentenceData);
                    })
            },
            classifyWords(){
                this.wrongWords = [];
                for(var i = 0; i < this.result.length; i++){
                    var _r = this.result[i];
                    if(!_r.accent || !_r.tone || !_r.prono) this.wrongWords.push(_r);
                }
            },
            getAudioSource(){
                if(!this.sentenceData) return;
                var _standUrl = this.sentenceData.sentence.audio_url;
                var _resultUrl = this.sentenceData.audio_url;
                
                var _this = this;
                axios.get(this.$serverURL + _standUrl, {responseType: 'blob'})
                    .then(function (response) {
                        if(response.data.error) return;

                        _this.standAudio = URL.createObjectURL(response.data);
                    })

                axios.get(this.$serverURL + _resultUrl, {responseType: 'blob'})
                    .then(function (response) {
                        if(response.data.error) return;

                        _this.resultAudio = URL.createObjectURL(response.data);
                    })
            },
            playAudioByWord(index, type){
                var _sTime = 0, _eTime = 0;
                if(type == 'stand'){
                    var _sTime = this.result[index].d_s_seek/1000;
                    var _eTime = this.result[index].d_e_seek/1000;
                    this.player.src = this.standAudio;
                }else{
                    var _sTime = this.result[index].r_s_seek/1000;
                    var _eTime = this.result[index].r_e_seek/1000;
                    this.player.src = this.resultAudio;
                }
                
                this.player.currentTime = _sTime;
                this.player.play();
                var _this = this;
                var _timer = setInterval(function(){
                    if(_this.player.currentTime >= _eTime){
                        _this.player.pause();
                        _this.currentTime = 0;
                    }
                }, 5);
                this.player.addEventListener("pause", function(){
                    clearInterval(_timer);
                });
            },
            playStandard(){
                if(this.selfStatus == _PLAY_STATUS || !this.sentenceData) return;
                if(this.standStatus == _PLAY_STATUS){
                    this.player.pause();
                    this.standStatus = _STOP_STATUS;
                    return;
                }

                this.player.src = this.$serverURL +  this.sentenceData.sentence.audio_url;
                this.player.play();
                this.standStatus = _PLAY_STATUS;

                var _this = this;
                this.player.addEventListener("ended", function(){
                    _this.standStatus = _STOP_STATUS;
                })
            },
            playSelf(){
                if(this.standStatus == _PLAY_STATUS || !this.sentenceData) return;
                if(this.selfStatus == _PLAY_STATUS){
                    this.player.pause();
                    this.selfStatus = _STOP_STATUS;
                    return;
                }

                var result_audio = this.sentenceData.audio_url;
                if(!result_audio) return;

                this.player.src = this.$serverURL + result_audio;
                this.player.play();
                this.selfStatus = _PLAY_STATUS;

                var _this = this;
                this.player.addEventListener("ended", function(){
                    _this.selfStatus = _STOP_STATUS;
                })
            },
            translation(){
                this.isTrans = !this.isTrans;
                console.log('translate');
            }
        }
    }
</script>
<style>
    .word-table td,
    .word-table th{
        border-top: 0px;
        font-weight: 400;
    }
    .border-bottom{
        border-bottom: 2px solid #efecec;
    }
    .trans_btn{
        border: 1px solid #5B5B5B;
        padding: 0px 16px;
        height: 22px!important;
    }
</style>