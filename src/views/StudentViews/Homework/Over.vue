<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/homework" class="link-primary ml-1">作业</router-link> >  
            <span class="ml-1">{{workName}}</span> 
        </p>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div v-if="homework" class="card  p-2">
                    <div class="d-flex align-items-center">
                        <div class="mr-auto" >
                            <div class="d-flex">
                                <avatar username="" :size="56" :src="homework.t_avatar" class="mr-2"/>
                                <div class="">
                                    <p class="mb-0 mt-1 fn-18">{{homework.t_name}}</p>
                                    <p class="mb-0 fn-danger fn-12" >超时</p>
                                </div>
                            </div>
                        </div>
                        <div class="border-circle border-danger fn-12 ml-2 fn-danger">{{homework.progress ? homework.progress : 0}}分</div>
                    </div>
                </div>
                <div class="card pt-3 pb-3"  style="max-height: 600px; overflow: auto">
                    <div v-for="(item, index) in workData" 
                        :key="index"
                        class="d-flex align-items-center p-2 sentence">
                        <div class="mr-auto fn-14">{{item.text}}</div>
                        <div class="fn-12" style="flex-shrink: 0">
                            <span v-if="!item.status"  class="fn-danger">超时</span>
                            <span v-else-if="item.student_results[0].marks >= 80" class="fn-success">{{item.student_results[0].marks}}分</span>
                            <span v-else-if="item.student_results[0].marks >= 60" class="fn-warning">{{item.student_results[0].marks}}分</span>
                            <span v-else  class="fn-danger">{{item.student_results[0].marks}}分</span>

                            <span class="ml-2">
                                <img :src="item.like ? 'img/icons/love_active.png' : 'img/icons/love.png'" 
                                    alt="record"
                                    class="icon-small"
                                    @click="setLike(index)">
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card col-8 fn-18 pt-4 pb-4 pl-4 pr-4" style="min-height: 500px">
                    <div class="text-center align-middle">
                        <p class="fn-36 text-muted mb-5">该作业已超时, 无法打开!</p>
                        <button type="button" class="btn btn-primary fn-16 pl-4 pr-4 mt-5" @click="extendTime">申请延时提交</button>
                    </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import Avatar from '@/components/Common/Avatar';
    import axios from 'axios';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                homework: null,
                workId: '',
                workName: '',
                workData: null
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
            if(!this.workId) this.gotoBack();
            
            this.initHomeworkData();
        },
        methods: {
            initHomeworkData(){
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
                        _this.homework = {
                            t_avatar: homework.course.teacher.avatar_url ? _this.$serverURL + homework.course.teacher.avatar_url : '',
                            t_name: homework.course.teacher.name,
                            deadline: homework.deadline,
                            progress: homework.homework_results.length ? homework.homework_results[0].progress : 0
                        }

                        var sentences = resData[1];
                        for(var index in sentences){
                            var sentence = sentences[index];
                            if(sentence.student_results.length) {
                                if(sentence.student_results[0].progress) sentence.status = true;
                                else { sentence.status = false; _this.unRead += 1;}
                                sentence.like = sentence.student_results[0].heart;  
                            }else{
                                sentence.status = 0;
                                sentence.like = false;
                            } 
                        }

                        _this.workData = sentences;
                        console.log(_this.workData);
                    })
            },
            extendTime(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/delayHomework/' + this.workId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        _this.$router.push({path: '/homework/uncomplete', query: {id: _this.workId, title: _this.workName}});        
                    })
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
            gotoBack(){
                this.$router.push('/homework');
            }
        }
    }
</script>
