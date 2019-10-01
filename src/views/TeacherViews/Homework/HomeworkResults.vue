<template>
    <ContentWrapper>
        <div class="card fn-18 m-0 p-4">
            <div class="card-header d-flex fn-18 fn-muted">
                <div class="mr-auto">
                    <router-link to="/teacher/homework" class="link-primary mr-1">作业</router-link> >  
                    <span class="ml-1">{{workName}}</span>
                </div>
                <button type="button" class="flex-row btn btn-outline-primary" @click="viewStatistices">作业统计</button>
            </div>
            <div class="radius_4 border_2_muted">
                <div class="tab-header d-flex fn-18 ml-0 mr-0 pt-3 border_b_2_muted">
                    <div :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">已完成</div>
                    <div :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">{{isEnded ? '超时' : '待完成'}}</div>
                </div>
                <div class="text-pan h-scroll" style="height: 650px">
                    <div v-for="(item, index) in dataList" v-bind:key="index" class="d-flex pt-3 pb-3 mr-0 ml-0" :class="index ? 'border_t_2_muted' : ''" >
                        <div class="flex-row ml-4 mr-auto text-center">
                            <div class="d-flex">
                                <avatar username="" :size="52" :src="getAvatar(item.student.avatar_url)" class="mr-2"/>
                                <div class="text-left mt-1">
                                    <p class="mb-0 mt-0 fn-18">{{item.student.name}}</p>
                                    <p v-if="item.avg_marks >= 80" class="mb-0 fn-14 fn-success">{{item.avg_marks}}分</p>
                                    <p v-else-if="item.avg_marks >= 60" class="mb-0 fn-14 fn-warning">{{item.avg_marks}}分</p>
                                    <p v-else class="mb-0 fn-14 fn-danger">{{item.avg_marks ? item.avg_marks : 0}}分</p>
                                </div>
                            </div>
                        </div>
                        <div class="flex-row mr-4 text-right">
                                <div v-if="selectedTabID">
                                    <button type="button" class="btn btn-outline-primary btn-sm fn-12" @click="viewStudentResults(index, 1)">已读</button><br>
                                    <button type="button" class="btn btn-outline-danger btn-sm fn-12" @click="viewStudentResults(index, 0)">未读</button>
                                </div>
                                <div v-else class="text-right">
                                    <div class="fn-16 fn-muted">{{item.completed_date}}</div>
                                    <button type="button" class="btn btn-primary btn-sm fn-12" @click="viewStudentResults(index, 2)">查看</button>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                workID: 0,
                workName: '',
                isEnded: true,
                resultList: [],

                selectedTabID: 0
            }
        },
        computed: {
            dataList: function(){
                var _list = [];
                for(var index in this.resultList){
                    var _result = this.resultList[index];
                    if(this.selectedTabID == 0 && _result.completed_date) _list.push(_result);
                    else if(this.selectedTabID == 1 && !_result.completed_date) _list.push(_result);
                }
                return _list;
            }
        },  
        mounted() {
            this.workID = this.$route.query.id;
            this.workName = this.$route.query.name;
            this.isEnded = this.$route.query.isEnded;

            this.initResultList();
        },
        methods: {
            initResultList(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/homeworkResults/' + this.workID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        _this.resultList = response.data;
                        console.log(_this.resultList);
                        // _this.fliterPageData();
                    })
            },
            viewStatistices(){
                this.$router.push({path:'/teacher/homework/statistics', query:{
                    work: this.workID,
                    path: this.workName }
                });
            },
            getAvatar(uri){
                if(uri) return this.$serverURL + uri;
                else return 'img/user/dummy_user.png'
            },
            selectTab(id){
                this.selectedTabID = id;
            },
            viewStudentResults(index, status){
                var _data = this.dataList[index];
                this.$router.push({path:'/teacher/homework/student_results', query:{
                    work: this.workID,
                    path: this.workName,
                    type: status,
                    s_id: _data.student_id,
                    s_name: _data.student.name, 
                    s_avatar: _data.student.avatar_url
                    }
                });
            }
        }
    }
</script>
<style>
    .tab-header div{
        color: #9E9E9E;
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
        color: #0093ec;
    }
    .text-pan{
        height: 526px;
    }
    .h-scroll{
        overflow: auto;
    }
</style>