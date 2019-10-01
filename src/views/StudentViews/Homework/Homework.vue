<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 作业</p>
        <div class="card ml-2 mr-2" style="min-height: 580px;">
            <div class="card-header pl-0 pr-0 ">
                <div class="tab-header  d-flex fn-24 ml-0 mr-0 pl-5 pr-5 mt-4">
                    <div :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">待完成</div>
                    <div :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">已完成</div>
                    <div :class="selectedTabID == 2 ? 'active' : ''" @click="selectTab(2)">超时</div>
                </div>
            </div>
            <div class="card-body pr-5 pl-5">
                <div v-for="(item, index) in tmpData" v-bind:key="index" class="row course-item pt-2 pb-2 mr-0 ml-0" >
                    <div class="col-9 text-center">
                        <div class="d-flex">
                            <avatar :username="item.course.teacher.name" :size="80" :src="item.course.teacher.avatar_url" class="mr-2"/>
                            <div class="text-left">
                                <p class="mb-0 mt-1 fn-20">{{item.name}}<span class="fn-16 ml-1">({{item.scope}})</span></p>

                                <p v-if="selectedTabID == 2" class="mb-0 mt-0 fn-16 fn-danger">超时</p>
                                <p v-else-if="selectedTabID == 1" class="mb-0 mt-0 fn-16 fn-success">{{item.homework_results[0].completed_date}}</p>
                                <p v-else class="mb-0 mt-0 fn-16"> 截止时间<span class="ml-2 fn-warning">{{item.deadline}}</span></p>
                                
                                <div class="d-flex">
                                    <p class="fn-16 mr-2">完成进度</p>
                                    <div class="progress progress-xs mb-3">
                                        <div class="progress-bar progress-bar-striped bg-info" 
                                            role="progressbar" 
                                            :aria-valuenow="item.progress" 
                                            :style="{width: item.progress + '%'}"
                                            aria-valuemin="0" aria-valuemax="100">
                                                <span class="sr-only">40% Complete</span>
                                        </div>
                                    </div>
                                    <p class="fn-12 ml-2 ">{{item.progress}} %</p>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="text-right">
                            <p class="fn-16 mt-2 text_muted" >2019/03/27</p>
                            <router-link v-if="selectedTabID == 2" :to="{path: item.isDelay ? '/homework/uncomplete' : '/homework/over', query: {id: item.id, title: item.name}}" title="HomeworkDetail">
                                <button type="button" class="btn btn-primary fn-16 pl-4 pr-4 pt-1 pb-1 mt-2">详情</button>
                            </router-link>
                            <router-link v-else-if="selectedTabID == 1" :to="{path: '/homework/complete', query: {id: item.id, title: item.name}}" title="HomeworkDetail">
                                <button type="button" class="btn btn-primary fn-16 pl-4 pr-4 pt-1 pb-1 mt-2">详情</button>
                            </router-link>
                            <router-link v-else :to="{path: '/homework/uncomplete', query: {id: item.id, title: item.name}}" title="HomeworkDetail">
                                <button type="button" class="btn btn-primary fn-16 pl-4 pr-4 pt-1 pb-1 mt-2">详情</button>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-center text-muted fn-24">
           — 没有更多了哦 —
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
                homeworks: [],
                completed: [],
                unCompleted: [],
                overed: [],
                tmpData: []
            }
        },
        mounted() {
            this.initView();
        },
        methods: {
            initView(){
                this.completed = [];
                this.unCompleted = [];
                this.overed = [];
                this.selectTab(0);
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/homeworks', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        console.log(resData);
                        for(var index in resData){
                            var data = resData[index];
                            if(data.course.teacher) data.course.teacher.avatar_url = _this.$serverURL + data.course.teacher.avatar_url;
                            var updatedDate = data.updatedAt;
                            data.updatedAt = updatedDate.substr(0, 4) + '/' + updatedDate.substr(5, 2) + '/' +updatedDate.substr(8, 2);
                            if(data.progress == 100) {
                                _this.completed.push(data);
                            }else{
                                var current = Date.now();
                                var dead = new Date(data.deadline).getTime();

                                if(current < dead) _this.unCompleted.push(data);
                                else {
                                    if(data.homework_results.length && data.homework_results[0].delay){
                                        var delay = new Date(data.homework_results[0].delay).getTime();
                                        if(current < delay) data['isDelay'] = true;
                                    }
                                    _this.overed.push(data);  
                                }
                            }
                        }
                    })
            },
            selectTab(id){
                this.selectedTabID = id;
                this.changeData();
            },
            changeData(){
                this.tmpData = [];
                if(this.selectedTabID == 0) this.tmpData = this.unCompleted;
                else if(this.selectedTabID == 1) this.tmpData = this.completed;
                else this.tmpData = this.overed;
            }
        }
    }
</script>
<style>
    .tab-header{
        border-bottom: 2px solid #EBEBEB;
        color: #A1A1A1;
    }
    .tab-header div{
        color: #848484;
        cursor: pointer;
        padding-bottom: 8px;
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: -2px;
    }
    .tab-header div.active{
        border-bottom: 2px solid #0093ec;
        color: black;
    }
    .course-item{
        color: black;    
        border-bottom: 2px solid #EBEBEB;
    }
    .course-item .progress.progress-xs{
        width: 400px;
        height: 16px;
        margin-top: 5px;
    }
</style>