<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/homework" class="link-primary ml-1">作业</router-link> > 
            <span class="ml-1">{{workName}}</span> 
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div v-if="homework" class="card p-2">
                    <div class="d-flex align-items-center">
                        <div class="mr-auto" >
                            <div class="d-flex">
                                <avatar username="" :size="56" :src="homework.t_avatar" class="mr-2"/>
                                <div class="text-left">
                                    <p class="mb-0 mt-1 fn-18">{{homework.t_name}}</p>
                                    <p v-if="homework.isDelay" class="fn-12"> 剩余时间 <span class="fn-warning ml-2">{{homework.rTime}}</span> </p>
                                    <p v-else class="fn-12"> 截止时间 <span class="fn-warning ml-2">{{homework.deadline}}</span> </p>
                                </div>
                            </div>
                        </div>
                        <div class="border-circle border-warning fn-12 ml-2 fn-warning two-rows"> <p>剰余</p><p>{{unRead}}题</p> </div>
                    </div>
                </div>
                <div class="card pt-3 pb-3" style="max-height: 600px; overflow: auto">
                    <div v-for="(item, index) in workData" 
                        :key="index"
                        :class="sentenceIndex == index ? 'active' : ''"
                        @click="selectSentence(index)"
                        class="d-flex align-items-center p-2 sentence">
                        <div class="fn-14 mr-auto">{{item.text}}</div>
                        <div class="fn-12 flex-shrink-0">
                            <span v-if="!item.status"  class="fn-danger">未读</span>
                            <span v-else-if="item.student_results[0].marks >= 80" class="fn-success">{{item.student_results[0].marks}}分</span>
                            <span v-else-if="item.student_results[0].marks >= 60" class="fn-warning">{{item.student_results[0].marks}}分</span>
                            <span v-else  class="fn-danger">{{item.student_results[0].marks}}分</span>

                            <span class="ml-3"><img src="img/icons/record.png" alt="record" class="icon-small"> </span>
                            <span class="ml-3">
                                <img :src="item.like ? 'img/icons/love_active.png' : 'img/icons/love.png'" 
                                    alt="record"
                                    class="icon-small"
                                    @click="setLike(index)">
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card col-8 p-4">
                <play-board 
                    :sentenceData="workData[sentenceIndex]" 
                    @changeResult="updateSentenceResult"
                    @changeLike="setLike(sentenceIndex)"
                    @viewAnalyticDetail="gotoDetail"/>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _HOMEWORK_ = 0;

    import Avatar from '@/components/Common/Avatar';
    import PlayBoard from '@/components/Common/PlayBoard';
    import axios from 'axios';
    export default {
        components: {
            Avatar,
            PlayBoard
        },
        data () {
            return {
                sentenceIndex: 0,
                homework: null,
                workId: '',
                workName: '',
                workData: [],
                unRead: 0
            }
        },
        computed: {
            totalTime: function(){
                if(!this.workData) return 0;
                
                var _time = 0;
                for(var index in this.workData.data){
                    _time += this.workData.data[index].time;
                }
                return _time;
            }
        },
        mounted() {
            this.workId = this.$route.query.id;
            this.workName = this.$route.query.title;
            if(!this.workId) this.$router.go(-1);
            
            this.initHomeworkData();
        },
        methods: {
            initHomeworkData(){
                // this.selectSentence(0);
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/homework/' + this.workId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        
                        var homework = resData[0];
                        console.log(homework);
                        _this.homework = {
                            t_id: homework.course.teacher_id,
                            t_avatar: homework.course.teacher.avatar_url ? _this.$serverURL + homework.course.teacher.avatar_url : '',
                            t_name: homework.course.teacher.name,
                            deadline: homework.deadline.substr(0, 16)
                        }
                        if(homework.homework_results.length && homework.homework_results[0].delay){
                            var _dT = new Date(homework.homework_results[0].delay).getTime();
                            _dT = Math.round((_dT - Date.now())/1000);
                            if(_dT < 0) _this.goOver(homework.id, homework.name);
                            
                            var _hour = Math.floor(_dT/3600);
                            var _min = Math.floor((_dT - _hour * 3600)/60);
                            var _sec = _dT % 60;
                            if(_hour < 10) _hour = '0' + _hour;
                            if(_min < 10) _min = '0' + _min;
                            if(_sec < 10) _sec = '0' + _sec;
                            _this.homework['isDelay'] = true;
                            _this.homework['rTime'] = _hour + ' : ' + _min + ' : ' + _sec;
                        }
                        
                        
                        var sentences = resData[1];
                        _this.unRead = 0;

                        for(var index in sentences){
                            var sentence = sentences[index];

                            // if(sentence.audio_url) sentence.audio_url = _this.$serverURL + sentence.audio_url;
                            if(sentence.student_results.length) {
                                if(sentence.student_results[0].marks) sentence.status = true;
                                else { sentence.status = false; _this.unRead += 1;}
                                sentence.like = sentence.student_results[0].heart;  
                            }else{
                                sentence.status = 0;
                                sentence.like = false;
                                _this.unRead += 1;
                            } 
                        }

                        _this.workData = sentences;
                        console.log(_this.workData);
                    })
            },
            selectSentence(index){
                this.sentenceIndex = index;
            },
            setLike(index){
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.workData[index].id;
                var isLike = !this.workData[index].like;
                axios.put(this.$serverURL + '/api/students/setLike/' + sentence_id, {isHeart: isLike}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.workData[index].like = isLike;
                    })
            },
            updateSentenceResult(data){
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.workData[this.sentenceIndex].id;
                axios.put(this.$serverURL + '/api/students/updateResultInHomework/' + sentence_id, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        console.log(response.data);
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.initHomeworkData();
                    })
            },
            gotoDetail(sen_id){
                this.$router.push({path: '/analytic_result', query: {path: ['作业', this.workName] , tid: this.homework.t_id, type: _HOMEWORK_, id: sen_id}});
            },
            goOver(id, name){
                _this.$router.push({path: '/homework/over', query: {id: id, title: name}});     
            }
        }
    }
</script>
<style>
    .two-rows{
        line-height: 12px!important;
        padding: 8px 0px;
    }
    .two-rows p{
        margin:0px;
    }
</style>