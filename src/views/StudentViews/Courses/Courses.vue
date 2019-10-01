<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 课程</p>
        <div class="card ml-2 mr-2">
            <div class="card-body p-0">
                <div v-for="(item, index) in courses" v-bind:key="index" class="d-flex border_b_2_muted" style="margin: 0px 26px; padding: 20px 0px">
                    <img class="book-thumb-2 mr-4 flex-shrink-0" :src="item.book_url ? item.book_url : 'img/dummy.png'" alt="Image" />
                    <div class="text-left mr-auto">
                        <p class="mb-0 mt-1 fn-24 fn-black">{{item.name}}</p>
                        <p class="mb-0 mt-0 fn-20">{{item.teacher.name}}</p>
                        <p class="mb-0 mt-0 fn-18"><span class="mr-2"> 待完成作业</span>{{item.uncompleted_works}}</p>
                        <div class="d-flex">
                            <p class="fn-18 mr-2">学习进度</p>
                            <div class="progress progress-xs mb-3">
                                <div class="progress-bar progress-bar-striped bg-info" role="progressbar" :aria-valuenow="item.progress" aria-valuemin="0" aria-valuemax="100" :style="{width: item.progress + '%'}">
                                    <span class="sr-only">40% Complete</span>
                                </div>
                            </div>
                            <p class="fn-12 ml-2 mt-1">{{Math.round(item.progress)}} %</p>
                        </div>
                        <router-link :to="{path: '/course/unit', query: {id: item.id, name: item.name}}">
                            <button type="button" class="btn btn-primary fn-20 pl-5 pr-5 mt-2">详情</button>
                        </router-link>
                    </div>
                    <div class="text-right fn-14">
                        <button v-if="item.isCompleted" type="button" class="btn btn-outline-primary">已完成</button>
                        <button v-else-if="item.progress > 0" type="button" class="btn btn-outline-warning">进行中</button>
                        <button v-else type="button" class="btn btn-outline-danger">加油哦</button>
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
    import axios from 'axios';
    export default {
        data () {
            return {
                courses: []
            }
        },
        mounted() {
            this.initCourseData();
        },
        methods: {
            initCourseData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/courses', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        console.log(resData);
                        for(var index in resData){
                            resData[index].book_url = resData[index].course_img ? _this.$serverURL + resData[index].course_img : 'img/dummy.png';
                        }

                        _this.courses = resData;
                    })
            }
        }
    }
</script>
<style>
    .progress.progress-xs{
        width: 400px;
        height: 16px;
        margin-top: 5px;
    }
</style>