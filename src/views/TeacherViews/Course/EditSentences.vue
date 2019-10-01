<template>
    <ContentWrapper>
        <div class="card p-4 m-0">
            <div class="card-header d-flex fn-18">
                <div class="flex-row mr-auto">
                    <router-link to="/teacher/course" class="link-primary">总课程</router-link> > 
                    <router-link v-if="pathInfo" 
                        :to="{path: '/teacher/course/units', query: {course_id: pathInfo.course_id, course_name: pathInfo.course_name}}"
                        class="link-primary">{{pathInfo.course_name}}</router-link> > 
                    <router-link v-if="pathInfo" 
                        :to="{path: '/teacher/course/lessons', query: {course_id: pathInfo.course_id, course_name: pathInfo.course_name, unit_id: pathInfo.unit_id, unit_name: pathInfo.unit_name}}"
                        class="link-primary">{{pathInfo.unit_name}}</router-link> > 
                    <span v-if="pathInfo" class="cursor-pointer" @click="goToBack">{{pathInfo.lesson_name}}</span> > 
                    添加内容
                </div>
                <button type="button" class="flex-row btn btn-primary mr-4" @click="setContent">保存</button>
                <button type="button" class="flex-row btn btn-outline-primary" @click="cancelContent">取消</button>
            </div>
            <div class="border_2_muted">
                <div class="d-flex mr-0 ml-0 fn-18 text-center border_b_2_muted">
                    <div v-for="(tab, index) in tabNames" :key="index" class="tab_item" :class="selectedTabID == index ? 'active' : ''" @click="selectTab(index)">{{tab}}</div>
                </div>
                <div class="border_b_2_muted ">
                    <div v-if="selectedTabID == 2 || selectedTabID == 3" class="p-3 fn-16 d-flex">
                        <div v-if="selectedTabID == 2" class="width_80" :class="errors.includes('title') ? 'fn-danger' : ''">标<span class="space-48"></span>题</div>
                        <div v-else class="width_80" :class="errors.includes('title') ? 'fn-danger' : ''">篇<span class="space-48"></span>名</div>
                        <div class="flex width-full pl-4">
                            <div class="shadow_pannel pl-3 pr-3">
                                <input type="text" class="width-full" style="border: none" v-model="newTitle">
                            </div>
                        </div>
                    </div>
                    <div class="p-3 fn-16 d-flex">
                        <div class="width_80" :class="errors.includes('text') ? 'fn-danger' : ''">内<span class="space-48"></span>容</div>
                        <div class="flex width-full pl-4">
                            <div class="shadow_pannel">
                                <div class="shadow_pannel_header pr-3 pl-3 d-flex">
                                    <input ref="audio_input" type="file" hidden @change="onAudioFileChange">
                                    <div class="flex-row mr-auto" :class="errors.includes('audio') ? 'fn-danger' : 'text-muted'">
                                        <div v-if="newAudio" class="fn-info">
                                            <img class="img-fluid icon-small mr-2 cursor-pointer" src="/img/icons/play_stand_active.png" @click="playAudio('new')"/>{{newAudio.name}}
                                            <img class="img-fluid icon-small mr-2 cursor-pointer ml-1 mb-1" src="/img/icons/wrong.png" @click="deleteNewAudio"/>
                                        </div>
                                        <div v-else class="cursor-pointer" @click="addAudioFile"><img class="img-fluid icon-small mr-2" src="/img/icons/play_stand.png"/>添加音频</div>
                                    </div>
                                    <div class="flex-row cursor-pointer" @click="addDataToList">添加到列表</div>
                                </div>
                                <div class="pr-3 pl-3">
                                    <textarea class="sentence_editor" id="" :rows="selectedTabID == 0 ? 1 : 3" v-model="newText" :placeholder="hintText"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div v-if="selectedTabID == 0" class="p-3 fn-16 d-flex">
                        <div class="width_80">音<span class="space-48"></span>标</div>
                        <div class="flex width-full pl-4">
                            <div class="shadow_pannel pl-3 pr-3">
                                <input type="text" class="width-full" style="border: none" v-model="newSymbol">
                            </div>
                        </div>
                    </div>
                    <div v-if="selectedTabID == 0" class="p-3 fn-16 d-flex">
                        <div class="width_80">翻<span class="space-48"></span>译</div>
                        <div class="flex width-full pl-4">
                            <div class="shadow_pannel pl-3 pr-3">
                                <textarea class="sentence_editor" id="" :rows="3" v-model="newTrans"></textarea>
                            </div>
                        </div>
                    </div> -->
                </div>
                
                <div class="p-3 fn-16 d-flex">
                    <div class="width_80">已添加内容</div>
                    <div class="width-full pl-4">
                        <div class="shadow_pannel pr-3 pl-3 h-fixed-250">
                            <div v-for="(item, index) in tmpData" :key="index" class="d-flex border_b_2_muted">
                                <div class="flex-row mr-auto">
                                    <div v-if="item.title">{{item.title}}</div>
                                    <div>{{item.text}}<span class="ml-4">{{item.symbol ? item.symbol : ''}}</span></div>
                                    <div>{{item.trans ? item.trans : ''}}</div>
                                </div>
                                <div class="flex-row right_actions">
                                    <img v-if="playingIndex == index" class="img-fluid icon-small mr-4" src="/img/icons/pause_stand.png" @click="stopAudio"/>
                                    <img v-else class="img-fluid icon-small mr-4" src="/img/icons/play_stand.png" @click="playAudio(index)"/>
                                    <img class="img-fluid icon-small mr-2" src="/img/icons/trash.png" @click="removeDataFromList(index)"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _SENTENCE = 0;
    const _WORD = 1;
    const _ARTICLE = 2;

    import axios from 'axios';
    import ImageViewer from '@/components/Common/ImageViewer'
    export default {
        components: {
            ImageViewer
        },
        data () {
            return {
                pathInfo: null,
                sentenceList: [],
                wordList: [],
                paragList: [],
                articleList: [],
                tmpData: [],
                selectedTabID: 0,

                removeList: [],
                addList: [],
                newTitle: '',
                newText: '',
                newAudio: null,
                newVideo: '',
                newSymbol: '',
                newTrans: '',
                testAudioUrl: '',
                errors: [],

                playingIndex: -1,
                tabNames: ['单词', '句子', '段落', '文章']//, '视频']
            }
        },
        watch: {
            newTitle: function(val){this.errors = []},
            newText: function(val){this.errors = []},
            newAudio: function(val){this.errors = []}
        },
        computed: {
            hintText: function(){
                if(this.selectedTabID == 2) return '不要超过25个单词';
                else if(this.selectedTabID == 3) return '不要超过60个单词';
                else return '';
            }
        },
        mounted() {
            this.pathInfo = this.$route.query;
            if(!this.pathInfo || !this.pathInfo.course_id || !this.pathInfo.course_name 
                || !this.pathInfo.unit_id || !this.pathInfo.unit_name 
                || !this.pathInfo.lesson_id || !this.pathInfo.lesson_name) {
                    this.$router.push('/teacher/course');
            }

            this.audioPlayer = new Audio();
            this.initSentenceData();
        },
        methods: {
            initSentenceData(){
                if(!this.pathInfo) return;
                
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/lessonData/'+ this.pathInfo.lesson_id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        
                        // _this.unitList = response.data;
                        var resData = response.data;
                        _this.sentenceList= [];
                        _this.wordList= [];
                        _this.articleList= [];
                        _this.paragList = [];
                        for(var i = 0; i < resData.length; i++){
                            if(resData[i].type == 'article') _this.articleList.push(resData[i]);
                            else if(resData[i].type == 'paragraph') _this.paragList.push(resData[i]);
                            else if(resData[i].type == 'word') _this.wordList.push(resData[i]);
                            else _this.sentenceList.push(resData[i]);
                        }
                        
                        console.log(_this.wordList);
                        _this.fliterData();
                    })
            },
            fliterData(){
                // this.tmpData = this.sentences;
                if(this.selectedTabID == 0) this.tmpData = this.wordList;
                else if(this.selectedTabID == 1) this.tmpData = this.sentenceList;
                else if(this.selectedTabID == 2) this.tmpData = this.paragList;
                else this.tmpData = this.articleList;

                // console.log(this.wordList);
            },
            selectTab(index){
                this.newTitle = '';
                this.newText = '';
                this.newSymbol = '';
                this.newTrans = '';
                this.newAudio = '';
                this.newVideo = '';
                this.testAudioUrl = '';
                this.selectedTabID = index;
                this.stopAudio();
                this.fliterData();
            },
            addDataToList(){
                var newData = {
                    title: this.newTitle,
                    text: this.newText,
                    symbol: this.newSymbol,
                    trans: this.newTrans,
                    audio_url: '',
                    video_url: this.newVideo,
                    type: ''
                };

                if(this.selectedTabID == 2 || this.selectedTabID == 3){
                    if(!newData.title) {this.errors.push('title'); return;}
                }
                if(!newData.text) {this.errors.push('text'); return;}
                if(!this.newAudio) {this.errors.push('audio'); return;}
                
                var _this = this;
                var token = this.$store.getters.getToken;
                var data = new FormData();
                data.append('audio_file', this.newAudio);
                axios.post(this.$serverURL + '/api/teachers/uploadSampleAudio', data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            _this.errors.push('audio');
                            return;
                        }
                        newData.audio_url = response.data.audio_url;
                        if(_this.selectedTabID == 0) {newData.type = 'word'; _this.wordList.push(newData);}
                        else if(_this.selectedTabID == 1) {newData.type = 'sentence'; _this.sentenceList.push(newData);}
                        else if(_this.selectedTabID == 2) {newData.type = 'paragraph'; _this.paragList.push(newData);}
                        else if(_this.selectedTabID == 3) {newData.type = 'article'; _this.articleList.push(newData);}

                        _this.addList.push(newData);
                        _this.newTitle = '';
                        _this.newText = '';
                        _this.newSymbol = '';
                        _this.newTrans = '';
                        // _this.newAudio = null;
                        _this.newVideo = '';
                        // _this.testAudioUrl = '';
                        _this.deleteNewAudio();
                        console.log(_this.wordList)
                        _this.fliterData();
                })
            },
            removeDataFromList(index){
                var data = this.tmpData.splice(index, 1)[0];
                if(this.addList.includes(data)){
                    this.addList.splice(this.addList.indexOf(data), 1);
                }else{
                    this.removeList.push(data.id);
                }
            },
            setContent(){
                var _this = this;
                var token = this.$store.getters.getToken;
                console.log(this.addList);

                if(this.removeList.length){
                    axios.post(this.$serverURL + '/api/teachers/deleteLessonData/'+ this.pathInfo.lesson_id, {lesson_ids: this.removeList}, {headers: {'authorization': `${token}`}})
                        .then(function (response) {
                            if(response.data.error){
                                if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            }
                            
                            _this.removeList = [];
                            if(!_this.addList.length) _this.goToBack();//_this.initSentenceData();
                        })
                }

                if(this.addList.length){
                    axios.post(this.$serverURL + '/api/teachers/createLessonData/'+ _this.pathInfo.lesson_id, {lesson_infos: this.addList}, {headers: {'authorization': `${token}`}})
                        .then(function (response) {
                            if(response.data.error){
                                if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            }
                            
                            _this.addList = [];
                            if(!_this.removeList.length) _this.goToBack();//_this.initSentenceData();
                        })
                }
            },
            playAudio(index){
                if(index == 'new'){
                    this.audioPlayer.src = this.testAudioUrl;
                    this.audioPlayer.play();
                }else if(this.tmpData[index].audio_url){
                    this.playingIndex = index;
                    this.audioPlayer.src = this.$serverURL + this.tmpData[index].audio_url;
                    this.audioPlayer.play();
                    var _this = this;
                    this.player.addEventListener("ended", function(){
                        _this.playingIndex = -1;
                    })
                }
            },
            stopAudio(){
                this.playingIndex = -1;
                this.audioPlayer.pause();
            },
            addAudioFile(){
                this.$refs.audio_input.click();
            },
            onAudioFileChange(e){
                var files = e.target.files || e.dataTransfer.files
                if (!files.length) return
                this.newAudio = files[0];
                // console.log(this.newAudio);
                var reader = new FileReader()
                var _this = this
                reader.onload = (e) => {
                    _this.testAudioUrl = e.target.result
                }
                reader.readAsDataURL(this.newAudio)
            },
            deleteNewAudio(){
                this.newAudio = null;
                this.testAudioUrl = '';
                this.$refs.audio_input.value = '';
            },
            cancelContent(){
                // this.errors = [];
                // this.addList = [];
                // this.removeList = [];
                // this.newTitle = '';
                // this.newText = '';
                // this.newAudio = '';
                // this.newVideo = '';
                this.goToBack();
            },
            goToBack(){
                this.$router.go(-1);
            }
        }
    }
</script>
<style>
    .shadow_pannel{
        box-shadow: 0px 4px 8px #00000020;
        border-radius: 4px;
        line-height: 40px;
    }
    .shadow_pannel_header{
        background-color: #F3F3F3;
        box-shadow: 0px 2px 4px #00000020;
    }
    .shadow_pannel .right_actions{
        min-width: 80px;
    }
    .sentence_editor{
        width: 100%;
        border: 0px;
        margin-top: 5px;
    }
    .width_80{
        width: 80px;
        flex-shrink: 0;
    }
    .h-fixed-250{
        height: 250px;
        overflow: auto;
    }
</style>
