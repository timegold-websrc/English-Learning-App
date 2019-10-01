<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <span v-for="(name, index) in links" :key="index" @click="$router.go(index - links.length)" class="link-primary cursor-pointer"> {{name}} ></span> 
            <span> 分析列表</span>
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div class="card  p-2">
                    <div class="d-flex align-items-center">
                        <div class="mr-auto" >
                            <div class="d-flex">
                                <avatar v-if="teacher_id" username="" :size="52" :src="teacher_avatar" class="mr-2"/>
                                <!-- <avatar v-else username="" :size="52" src="/img/user/dummy_user.png" class="mr-2"/> -->
                                <div class="text-left">
                                    <p class="mb-0 mt-1 fn-18">{{teacher_name}}</p>
                                    <p v-if="total_marks >= 80" class="mb-0 fn-success fn-12" >优秀完成</p>
                                    <p v-else-if="total_marks >= 60" class="mb-0 fn-success fn-12" >完成</p>
                                    <p v-else class="mb-0 fn-danger fn-12" >未完成</p>
                                </div>
                                <div v-if="total_marks >= 80" class="text-left ml-1 mt-2">
                                    <img src="img/icons/finger.png" alt="record" class="icon-26">
                                </div>
                            </div>
                        </div>
                        <div v-if="total_marks >= 80">
                            <img src="img/icons/great.png" alt="record" class="icon-standard">
                            <div class="border-circle border-success fn-11 ml-2 fn-success">{{total_marks}}分</div>
                        </div>
                        <div v-else-if="total_marks >= 60">
                            <img src="img/icons/good.png" alt="record" class="icon-standard">
                            <div class="border-circle border-warning fn-11 ml-2 fn-warning">{{total_marks}}分</div>
                        </div>
                        <div v-else>
                            <img src="img/icons/sad.png" alt="record" class="icon-standard">
                            <div class="border-circle border-danger fn-11 ml-2 fn-danger">{{total_marks}}分</div>
                        </div>
                    </div>
                </div>
                <div class="card fn-20 pt-3 pb-3" style="min-height: 560px">
                    <div class="d-flex align-items-center p-2 sentence">
                        <div class="mr-auto">{{sentenceText}}</div>
                        <div class="ml-1" style="flex-shrink: 0">
                            <span v-if="total_marks >= 80" class="fn-success">{{total_marks}}</span>
                            <span v-else-if="total_marks >= 60" class="fn-warning">{{total_marks}}</span>
                            <span v-else  class="fn-danger">{{total_marks}}</span>

                            <span class="ml-2"><em class="fa-x fas fa-chevron-right"></em></span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="recordStatus == 'retry'" class="card col-8 fn-18 p-4 text-center">
                <div class="fn-36 text-center border_b_2_muted mt-2 mb-2 pb-2">
                    <span v-for="(word, index) in result" 
                        :key="index"
                        :class="wrongWords.includes(word) ? 'fn-danger' : ''"
                        class="mr-2" >
                        {{word.text}}
                    </span>
                </div>
                <div class="text-pan" style="overflow:auto; height: 380px">
                    <div class="table-responsive fn-24">
                        <table class="table table-hover table-fixed word-table">
                            <thead>
                                <tr><th>单词</th><th>标准音</th><th>自读音</th><th>发音</th><th>口音</th><th>语调</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="(word, index) in result" :key="index">
                                    <td :class="wrongWords.includes(word) ? 'fn-danger' : ''">{{word.text}}</td>
                                    
                                    <td><img src="img/icons/play_stand.png" alt="record" class="icon-30" @click="playAudioByWord(index, 'stand')"></td>
                                    <td><img src="img/icons/play_stand.png" alt="record" class="icon-30" @click="playAudioByWord(index, 'result')"></td>

                                    <td><img :src="'img/icons/' + (word.prono ? 'pass' : 'wrong') +'.png'" alt="record" class="icon-26"></td>
                                    <td><img :src="'img/icons/' + (word.accent ? 'pass' : 'wrong') +'.png'" alt="record" class="icon-26"></td>
                                    <td><img :src="'img/icons/' + (word.tone ? 'pass' : 'wrong') +'.png'" alt="record" class="icon-26"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="mt-4 text-center d-flex flex-center">
                    <div class="align-bottom mr-5 standard-btn" @click="playStandard">
                        <img :src="'img/icons/' + standBtnIcon" alt="record" class="icon-46">
                        <p class="mb-0 mt-1 fn-12">标准音</p>    
                    </div>
                    <div class="record-btn" @click="changeRecordStatus">
                        <img src="img/icons/record_retry.png" alt="record" class="icon-78 cursor-pointer">
                        <p  class="mb-0 mt-1 fn-12">重新阅读</p>    
                    </div>
                    <div class="align-bottom ml-5 self-btn" @click="playSelf">
                        <img :src="'img/icons/' + selfBtnIcon" alt="record" class="icon-46">
                        <p  class="mb-0 mt-1 fn-12">自读音</p>    
                    </div>
                </div>
            </div>
            <div v-else class="card col-8 p-4">
                <play-board 
                    :sentenceData="sentenceData" 
                    @changeResult="updateSentenceResult"
                    @changeLike="setLike"
                    @viewAnalyticDetail="gotoDetail"/>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _STOP_STATUS = 'start';
    const _PLAY_STATUS = 'stop';
    const _RETRY_STATUS = 'retry';

    const _HOMEWORK_    = 0;
    const _LESSON_      = 1;
    const _OUT_LESSON_  = 2;
    const _COLLECTION_  = 3;
    const _GAME_        = 4;
    const _WRONG_COLLECTION_ = 5;

    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    import PlayBoard from '@/components/Common/PlayBoard';
    
    export default {
        components: {
            Avatar,
            PlayBoard
        },
        data () {
            
            return {
                userRole: null,
                links: [],
                type: null,
                sentenceID: null,
                teacher_id: 0,
                teacher_name: '',
                teacher_avatar: '',
                sentenceData: null,

                result: [],
                wrongWords: [],

                recordStatus: _RETRY_STATUS,
                standStatus: _STOP_STATUS,
                selfStatus: _STOP_STATUS,

                standAudio: null,
                resultAudio: null
            }
        },
        created() {
            
        },
        mounted() {
            this.userRole = this.$store.getters.getRole;

            this.links = this.$route.query.path;
            this.sentenceID = this.$route.query.id;
            this.teacher_id = this.$route.query.tid;
            this.type = this.$route.query.type;
            
            this.getTeacherInfo();
            this.initSentence();

            this.player = new Audio();
        },
        computed: {
            recordBtnIcon: function(){
                if(this.recordStatus == _STOP_STATUS) return 'record_start.png';
                else if(this.recordStatus == _PLAY_STATUS) return 'record_stop.png';
                else return 'record_retry.png';
            },
            standBtnIcon: function(){
                if(this.standStatus == _STOP_STATUS) return 'play_stand.png';
                else return 'pause_stand.png';
            },
            selfBtnIcon: function(){
                if(this.selfStatus == _STOP_STATUS) return 'play_self.png';
                else return 'pause_self.png';
            },
            total_marks: function(){
                if(!this.sentenceData) return 0;
                return this.sentenceData.student_results[0].marks;
            },
            sentenceText: function(){
                if(!this.sentenceData) return '';
                return this.sentenceData.text;
            },
            audioSource () {
                const url = this.sentenceData ? this.$serverURL + this.sentenceData.audio_url : '';
                if (url) {
                    return url
                } else {
                    this.player.pause();
                    return ''
                }
            },
        },
        methods: {
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
            getTeacherInfo(){
                if(!this.teacher_id) return;
                var _this = this;
                var token = this.$store.getters.getToken;
                
                if(this.userRole == 'student'){
                    axios.get(this.$serverURL + '/api/students/teacherInfo/' + this.teacher_id, {headers: {'authorization': `${token}`}})
                        .then(function (response) {
                            if(response.data.error){
                                if(response.data.error == 'tokenError') _this.$router.push('/login');
                                else return;
                            }

                            var resData = response.data;
                            // console.log(resData);
                            _this.teacher_name = resData.name;
                            _this.teacher_avatar = _this.$serverURL + resData.avatar_url;
                        });
                }else{
                    this.teacher_name = '老师';
                    this.teacher_avatar = 'img/user/dummy_user.png';
                }
            },
            initSentence: function(){
                var path = this.$serverURL;
                if(this.type == _HOMEWORK_ || this.type == _LESSON_) path += '/api/students/sentence_result/' + this.sentenceID;
                else if(this.type == _OUT_LESSON_){
                    if(this.userRole == 'student') path += '/api/students/out_sentence_result/' + this.sentenceID;
                    else path += '/api/guests/out_sentence_result/' + this.sentenceID;
                } else if(this.type == _COLLECTION_) path += '/api/collections/collection/' + this.sentenceID;
                else if(this.type == _GAME_) path += '/api/collections/game_sentence/' + this.sentenceID;
                else if(this.type == _WRONG_COLLECTION_) path += '/api/collections/wrong_collection/' + this.sentenceID;
                else return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(path, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        if(_this.type == _OUT_LESSON_) resData['student_results'] = resData.out_results;
                        else if(_this.type == _COLLECTION_) resData['student_results'] = [resData.collection_result];
                        else if(_this.type == _GAME_) resData['student_results'] = resData.game_results;
                        else if(_this.type == _WRONG_COLLECTION_) resData['student_results'] = resData.wrong_collection_results;
                        
                        
                        if(!resData.student_results.length) _this.$router.go(-1);

                        _this.sentenceData = resData;
                        _this.sentenceData['like'] = resData.student_results[0].heart;
                        _this.result = JSON.parse(resData.student_results[0].result);
                        // console.log(_this.sentenceData);
                        _this.getAudioSource();
                        _this.classifyWords();
                    });
            },
            getAudioSource(){
                if(!this.sentenceData) return;
                var _standUrl = this.sentenceData.audio_url;
                var _resultUrl = this.sentenceData.student_results[0].audio_url;
                
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
            classifyWords(){
                this.wrongWords = [];
                for(var i = 0; i < this.result.length; i++){
                    var _r = this.result[i];
                    if(!_r.accent || !_r.tone || !_r.prono) this.wrongWords.push(_r);
                }
            },

            changeRecordStatus(){
                this.recordStatus = _STOP_STATUS;
            },
            playStandard(){
                if(this.selfStatus == _PLAY_STATUS || !this.sentenceData) return;
                if(this.standStatus == _PLAY_STATUS){
                    this.player.pause();
                    this.standStatus = _STOP_STATUS;
                    return;
                }
                
                this.player.src = this.$serverURL +  this.sentenceData.audio_url;
                this.player.play();
                this.standStatus = _PLAY_STATUS;

                var _this = this;
                this.player.addEventListener("ended", function(){
                    _this.standStatus = _STOP_STATUS;
                })
            },
            playSelf(){
                if(this.standStatus == _PLAY_STATUS || !this.sentenceData || !this.sentenceData.student_results.length) return;
                if(this.selfStatus == _PLAY_STATUS){
                    this.player.pause();
                    this.selfStatus = _STOP_STATUS;
                    return;
                }

                var result_audio = this.sentenceData.student_results[0].audio_url;
                if(!result_audio) return;

                this.player.src = this.$serverURL + result_audio;
                this.player.play();
                this.selfStatus = _PLAY_STATUS;

                var _this = this;
                this.player.addEventListener("ended", function(){
                    _this.selfStatus = _STOP_STATUS;
                })
            },

            updateSentenceResult(data){
                var path = this.$serverURL;
                if(this.type == _HOMEWORK_) path += '/api/students/updateResultInHomework/' + this.sentenceID;
                else if(this.type == _LESSON_) path += '/api/students/updateResultInCourse/' + this.sentenceID;
                else if(this.type == _OUT_LESSON_) {
                    if(this.userRole == 'student') path += '/api/students/updateResultInOutLesson/' + this.sentenceID;
                    else path += '/api/guests/updateResultInOutLesson/' + this.sentenceID;
                } else if(this.type == _COLLECTION_) path += '/api/collections/updateCollectionResult/' + this.sentenceID;
                else if(this.type == _GAME_) path += '/api/collections/updateGameResult/' + this.sentenceID;
                else if(this.type == _WRONG_COLLECTION_) path += '/api/collections/updateWrongCollectionResult/' + this.sentenceID;
                else return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(path, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        // console.log(response.data);
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.recordStatus = _RETRY_STATUS;
                        _this.initSentence();
                    })
            },
            setLike(){
                var path = this.$serverURL;
                if(this.type == _HOMEWORK_ || this.type == _LESSON_) path += '/api/students/setLike/' + this.sentenceID;
                else if(this.type == _OUT_LESSON_) {
                    if(this.userRole == 'student') path += '/api/students/setLikeInOutLesson/' + this.sentenceID;
                    else path += '/api/guests/setLikeInOutLesson/' + this.sentenceID;
                } else return;

                var _this = this;
                var token = this.$store.getters.getToken;
                var isLike = !this.sentenceData.like;
                axios.put(path, {isHeart: isLike}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.sentenceData.like = isLike;
                    })
            },
            gotoDetail(){
                this.recordStatus = _RETRY_STATUS;
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
    /* .table-fixed thead {
    width: 97%;
    }
    .table-fixed tbody {
    height: 230px;
    overflow-y: auto;
    width: 100%;
    }
    .table-fixed thead, .table-fixed tbody, .table-fixed tr, .table-fixed td, .table-fixed th {
    display: block;
    }
    .table-fixed tbody td, .table-fixed thead > tr> th {
    float: left;
    border-bottom-width: 0;
    } */
</style>