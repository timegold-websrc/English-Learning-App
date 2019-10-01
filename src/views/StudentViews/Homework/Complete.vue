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
                            <div class="d-flex align-items-center">
                                <avatar username="" :size="56" :src="homework.t_avatar" class="mr-2"/>
                                <div class="">
                                    <p class="mb-0 fn-18">{{homework.t_name}}
                                        <img v-if="homework.avg_marks >= 80" src="img/icons/finger.png" alt="image" class="icon-26 ml-1">
                                    </p>
                                    <p v-if="homework.complete" class="mb-0 fn-success fn-12" >{{homework.complete}}</p>
                                    <p v-else class="mb-0 fn-danger fn-12" >待完成</p>
                                </div>
                            </div>
                        </div>
                        <div v-if="homework.avg_marks >= 80" class="d-flex">
                            <img src="img/icons/great.png" alt="record" class="icon-standard">
                            <div class="border-circle border-success fn-12 ml-2 fn-success">{{homework.avg_marks}}分</div>
                        </div>
                        <div v-else-if="homework.avg_marks >= 60" class="d-flex">
                            <img src="img/icons/good.png" alt="record" class="icon-standard">
                            <div class="border-circle border-warning fn-12 ml-2 fn-warning">{{homework.avg_marks}}分</div>
                        </div>
                        <div v-else class="d-flex">
                            <img src="img/icons/sad.png" alt="record" class="icon-standard">
                            <div class="border-circle border-danger fn-12 ml-2 fn-danger">{{homework.avg_marks ? homework.avg_marks : 0}}分</div>
                        </div>
                    </div>
                </div>
                <div class="card pt-3 pb-3">
                    <div class="fn-18 border-bottom pl-4 pb-2 fn-black">{{selectedStdName}}</div>
                    <div style="max-height: 542px;overflow:auto">
                        <div v-for="(item, index) in workData" 
                            :key="index"
                            class="d-flex align-items-center p-2 sentence">
                            <div class="mr-auto">{{item.text}}</div>
                            <div class="fn-12" style="flex-shrink: 0">
                                <span v-if="!item.student_results.length" class="fn-danger">0分</span>
                                <span v-else-if="item.student_results[0].marks >= 80" class="fn-success">{{item.student_results[0].marks}}分</span>
                                <span v-else-if="item.student_results[0].marks >= 60" class="fn-warning">{{item.student_results[0].marks}}分</span>
                                <span v-else  class="fn-danger">{{item.student_results[0].marks ? item.student_results[0].marks: 0}}分</span>

                                <span class="ml-2">
                                    <img :src="getSentenceLike(index) ? 'img/icons/love_active.png' : 'img/icons/love.png'" alt="record" class="icon-small" @click="setLike(index)">
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card col-8 fn-18 pt-4 pl-0 pr-0">
                
                <div class="card-header fn-24 fn-black ml-4">排行榜</div>
                <div class="leaderboard-tab  d-flex fn-18 ml-0 mr-0 pl-2 pr-2">
                    <div :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">总分</div>
                    <div :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">时间</div>
                </div>
                <div v-if="rankList" class="text-pan h-scroll">
                    <div v-for="(item, index) in rankList" v-bind:key="index" class="d-flex p-2 mr-2 ml-2 align-items-center cursor-pointer" @click="selectStudent(index)">
                        <div class="mr-auto text-center">
                            <div class="d-flex">
                                <div v-if="index < 3" class="rank mt-2">
                                    <img :src="'img/icons/rank_'+ (index+1) +'.png'" alt="record" class="rank">
                                    <p class="mb-0 rank-num fn-12">{{index+1}}</p>
                                </div>
                                <div v-else class="rank fn-24 mt-2">{{index+1}}</div>
                                <avatar username="白拫" :size="52" :src="item.avatar" class="mr-2"/>
                                <div class="text-left mt-2">
                                    <p v-if="myRankID == index" class="mb-0 mt-0 fn-18">我</p>
                                    <p v-else class="mb-0 mt-0 fn-18">{{item.name}}</p>

                                    <p v-if="!selectedTabID" class="mb-0 fn-12">
                                        <span v-if="item.completed_date" class="text-muted">{{item.completed_date}}</span>
                                        <span v-else class="fn-danger">待完成</span>
                                    </p>
                                    <p v-else class="mb-0 text-muted fn-12">得分{{item.avg_marks}}分</p>
                                </div>
                            </div>
                        </div>
                        <div class="">
                            <div class="text-right">
                                <div v-if="!selectedTabID">
                                    <div v-if="item.avg_marks >= 80" class="border-circle border-success fn-14 ml-2 fn-success">{{item.avg_marks}}分</div>
                                    <div v-else-if="item.avg_marks >= 60" class="border-circle border-warning fn-14 ml-2 fn-warning">{{item.avg_marks}}分</div>
                                    <div v-else class="border-circle border-danger fn-14 ml-2 fn-danger">{{item.avg_marks ? item.avg_marks : 0}}分</div>
                                </div>
                                <div v-else>
                                    <div v-if="item.completed_date" class="ml-2 mt-2 fn-info fn-16">{{item.completed_date}}</div>
                                    <div v-else class="ml-2 mt-2 fn-danger fn-16">待完成</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <div v-if="rankList.length" class="d-flex self-rank p-2 mr-0 ml-0 align-items-center cursor-pointer"  @click="selectStudent(myRankID)">
                    <div class="mr-auto text-center">
                        <div class="d-flex">
                            <div class="rank fn-20 mt-2">{{myRankID+1}}</div>
                            <avatar username="" :size="46" :src="rankList[myRankID].avatar" class="mr-2"/>
                            <div class="text-left mt-0">
                                <p class="mb-0 mt-0 fn-16">我</p>
                                
                                <p v-if="!selectedTabID" class="mb-0 fn-12">{{rankList[myRankID].completed_date}}</p>
                                <p v-else class="mb-0 fn-12">得分{{rankList[myRankID].avg_marks}}分</p>
                            </div>
                        </div>
                    </div>
                    <div class="">
                        <div class="text-right">
                            <div v-if="!selectedTabID" class="border-circle border-white fn-14 ml-2">{{rankList[myRankID].avg_marks}}分</div>
                            <div v-else class="ml-2 mt-2 fn-14">{{rankList[myRankID].completed_date}}</div>
                        </div>
                    </div>
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
                selectedTabID: 0,
                selectedStdName: '',
                homework: null,
                workId: '',
                workName: '',
                workData: null,
                rankList: [],
                myRankID: null
            }
        },
        computed: {
            
        },
        mounted() {
            this.workId = this.$route.query.id;
            this.workName = this.$route.query.title;
            if(!this.workId) this.$router.go(-1);
            this.initHomeworkData();
            this.initLeaderboard();
        },
        methods: {
            initHomeworkData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                this.selectedStdName = '我';
                axios.get(this.$serverURL + '/api/students/homework/' + this.workId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        
                        console.log(resData);
                        var homework = resData[0];
                        var com_date = '';
                        if(homework.homework_results.length){
                            com_date = homework.homework_results[0].completed_date;
                            com_date = com_date.substr(0, 16) + com_date.substr(19, 3);
                        }
                        _this.homework = {
                            t_avatar: homework.course.teacher.avatar_url ? _this.$serverURL + homework.course.teacher.avatar_url : '',
                            t_name: homework.course.teacher.name,
                            complete: com_date,
                            avg_marks: homework.homework_results.length ? homework.homework_results[0].avg_marks : 0
                        }
                        _this.workData = resData[1];
                    })
            },
            initOtherData(index){
                var _this = this;
                var token = this.$store.getters.getToken;
                var std_id = this.rankList[index].id;
                this.selectedStdName = this.rankList[index].name;
                axios.get(this.$serverURL + '/api/students/other/homework_result/'+ std_id + '/' + this.workId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        
                        var homework = resData[0];
                        var com_date = '';
                        if(homework.homework_results.length){
                            com_date = homework.homework_results[0].completed_date;
                            if(com_date) com_date = com_date.substr(0, 16) + com_date.substr(19, 3);
                        }
                        _this.homework = {
                            t_avatar: homework.course.teacher.avatar_url ? _this.$serverURL + homework.course.teacher.avatar_url : '',
                            t_name: homework.course.teacher.name,
                            complete: com_date,
                            avg_marks: homework.homework_results.length ? homework.homework_results[0].avg_marks : 0
                        }
                        _this.workData = resData[1];
                    })
            },
            initLeaderboard: function(){
                this.selectedTabID = 0;
                this.marksRanking();
            },
            marksRanking(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/progress_ranking/' + this.workId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        _this.serializeData(resData);
                    })
            },
            dateRanking(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/date_ranking/' + this.workId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        _this.serializeData(resData);
                    })
            },
            serializeData(data){
                this.rankList = [];
                this.myRankID = null;
                if(!data && !data.list.length) {
                    return;
                }
                this.myRankID = data.my_id;
                var myIndex = 0;
                for(var i = 0; i < data.list.length; i++){
                    
                    var stData = data.list[i];
                    if(stData.id == this.myRankID) myIndex = i;

                    var _data = {
                        id: stData.id,
                        avatar: stData.avatar_url ? this.$serverURL + stData.avatar_url : 'img/user/dummy_user.png',
                        name: stData.name,
                        avg_marks: 0,
                        completed_date: '',
                        status: false
                    }
                    if(stData.homework_results.length){
                        _data.avg_marks = stData.homework_results[0].avg_marks;
                        var _com_date = stData.homework_results[0].completed_date;
                        if(_com_date){
                            _data.completed_date = _com_date.substr(0, 16) + _com_date.substr(19);
                            _data.status = true;
                        }
                    }
                    this.rankList.push(_data);
                }
                this.myRankID = myIndex;
            },
            selectTab(id){
                this.selectedTabID = id;
                if(this.selectedTabID == 1) this.dateRanking();
                else this.marksRanking();
            },
            setLike(index){
                if(this.selectedStdName != '我') return;

                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.workData[index].id;
                var isLike = !this.getSentenceLike(index);
                axios.put(this.$serverURL + '/api/students/setLike/' + sentence_id, {isHeart: isLike}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.initHomeworkData();
                    })
            },
            getSentenceLike(index){
                var data = this.workData[index];
                if(!data.student_results.length) return false;
                else return !!data.student_results[0].heart;
            },
            selectStudent(index){
                if(index == this.myRankID) this.initHomeworkData();
                else this.initOtherData(index);
            }      
        }
    }
</script>
<style>
    .leaderboard-tab{
        border-bottom: 2px solid #efecec;        
    }
    .leaderboard-tab div{
        color: #848484;
        cursor: pointer;
        padding-bottom: 8px;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: -2px;
    }
    .leaderboard-tab div.active{
        border-bottom: 2px solid #0093ec;
        color: #0093ec;
    }
    .text-pan{
        height: 526px;
    }
    .h-scroll{
        overflow-y: scroll;
    }
    .rank{
        width: 40px;
        position: relative;
    }
    .rank .rank-num{
        position: absolute;
        top: 22px;
        width: 100%;
        color: black;
    }
    .self-rank{
        background-color: #5096c1;
        color: white;
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
    }
</style>