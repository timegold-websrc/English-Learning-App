<template>
    <ContentWrapper :unwrap = true>
        <!-- <div class="content-heading">Carousel</div> -->
        <b-carousel id="carousel1"
                    style="text-shadow: 1px 1px 2px #333;"
                    controls
                    indicators
                    background="#ababab"
                    :interval="2000"
                    img-width="1280"
                    img-height="740"
                    v-model="slide"
                    @sliding-start="onSlideStart"
                    @sliding-end="onSlideEnd">

            <b-carousel-slide img-src="img/banners/banner_1.png">
            </b-carousel-slide>
            <!-- Text slides with image -->
            <b-carousel-slide caption="First slide"
                            text="Nulla vitae elit libero, a pharetra augue mollis interdum."
                            img-src="img/banners/banner_1.png"
            ></b-carousel-slide>

            <!-- Slides with custom text -->
            <b-carousel-slide img-src="img/banners/banner_1.png">
                <h1>Hello world!</h1>
            </b-carousel-slide>

            <!-- Slides with image only -->
            <b-carousel-slide img-src="img/banners/banner_1.png">
            </b-carousel-slide>

            <!-- Slides with image only -->
            <b-carousel-slide img-src="img/banners/banner_1.png">
            </b-carousel-slide>
        </b-carousel>
        <div v-if="userRole == 'student'" class="pannel  pt-5 pb-3">
            <div class="pannel-header text-center mb-4">
                <div class="pannel-title">我的作业</div>
                <div class="pannel-subtitle">My homework</div>
            </div>
            <div class="container pannel-body text-center">
                <div v-for="(item, index) in homeworks" v-bind:key="index" class="row home-item mb-4 mr-0 ml-0" >
                    <div class="col-md-8 text-center">
                        <div class="d-flex">
                            <avatar username="" :size="120" :src="item.course.teacher.avatar_url" class="mr-2"/>
                            <div class="text-left">
                                <p class="mb-0 mt-1 fn-28 fn-black">{{item.name}}</p>
                                <p class="mb-0 fn-20 fn-black">{{item.course.teacher.name}}</p>
                                <p class="mb-0 fn-24"><span class="text-muted">截止时间</span><span style="color: #D2910E; margin-left: 10px">{{item.deadline}}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-right">
                            <p class="mb-4 mt-2 fn-20">{{item.updatedAt}}</p>
                            <button type="button" class="btn btn-outline-primary fn-18" @click="goHomework(index)">开始学习</button>
                        </div>
                    </div>
                </div>
                <router-link v-if="homeworks.length" to="/homework"><button type="button" class="btn btn-primary fn-28 btn_detail">查看更多</button></router-link>
                <div v-else class="fn-18">— 没有作业 —</div>
            </div>
        </div>
        <div v-if="userRole == 'student'" class="pannel bg-1 pt-5 pb-3">
            <div class="pannel-header text-center mb-4">
                <div class="pannel-title">我的课程</div>
                <div class="pannel-subtitle">My course</div>
            </div>
            <div class="pannel-body text-center"  >
                <!-- style="margin: 0px 120px"> -->
                <div class="d-flex flex-center flex-wrap" >
                    <div v-for="(item, index) in courses" v-bind:key="index" class="p-0 text-center" style="margin: 0px 40px" @click="goCourse(index)">
                        <img class="book-thumb-1" :src="item.book_url ? item.book_url : 'img/dummy.png'" alt="Image" />
                        <p class="mb-2 mt-2 fn-30 fn-bold fn-black">{{item.name.length > 12 ? item.name.substr(0, 10) + '...': item.name}}</p>
                        <p class="mb-2 fn-18">任课老师： {{item.teacher.name}}</p>
                    </div>
                </div>
                <!-- <div class="row mb-4" >
                    <div v-for="(item, index) in courses" v-bind:key="index" class="col-md-4 m-0 p-0 text-center" @click="goCourse(index)">
                        <img class="book-thumb-1" :src="item.book_url" alt="Image" />
                        <p class="mb-2 mt-2 fn-30 fn-bold fn-black">{{item.name}}</p>
                        <p class="mb-2 fn-18">任课老师： {{item.teacher.name}}</p>
                    </div>
                </div> -->
                <router-link v-if="courses.length" to="/course"><button type="button" class="btn btn-primary fn-28 btn_detail">查看更多</button></router-link>
                <div v-else class="fn-18">— 没有课程 —</div>
            </div>
        </div>
        <!-- <div class="pannel pt-5 pb-3">
            <div class="pannel-header text-center mb-4">
                <div class="pannel-title">课外阅读</div>
                <div class="pannel-subtitle">Outside reading</div>
            </div>
            <div class="pannel-body text-center" style="margin: 0px 155px">
                <div v-for="(item, index) in outbooks" v-bind:key="index" class="d-flex align-items-center book_item" style="margin-bottom: 34px" @click="goOutCourse(index)">
                    <div class="flex-shrink-0" style="margin-right: 40px">
                        <img class="book-thumb-2" :src="item.book.book_url" alt="Image" />
                    </div>
                    <div class="text-left">
                        <p class="mb-1 mt-1 fn-30 fn-black">{{item.book.name}}</p>
                        <p class="mb-1 fn-24">{{item.book.author}}</p>
                        <p class="mb-1 text-muted fn-14">{{item.book.description}}</p>
                    </div>
                </div>
                <router-link v-if="outbooks.length" to="/extracourse"><button type="button" class="btn btn-primary fn-28 btn_detail">查看更多</button></router-link>
                <div v-else class="fn-18">— 没有课外阅读 —</div>
            </div>
        </div> -->
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
                slide: 0,
                sliding: null,
                homeworks: [],
                courses: [],
                outbooks: [],

                userRole: null
            }
        },
        mounted() {
            this.userRole = this.$store.getters.getRole;
            console.log(this.userRole);
            if(this.userRole == 'student'){
                this.initHomeworks();
                this.initCourses();
            }
            
            this.initOutSide();
        },
        methods: {
            onSlideStart (slide) {
                this.sliding = true
            },
            onSlideEnd (slide) {
                this.sliding = false
            },
            initHomeworks(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/homeworks/limit/3', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        var resData = response.data;
                        console.log(resData);
                        for(var index in resData){
                            resData[index].course.teacher.avatar_url = _this.$serverURL + resData[index].course.teacher.avatar_url;
                            var updatedDate = resData[index].updatedAt;
                            resData[index].updatedAt = updatedDate.substr(0, 4) + '/' + updatedDate.substr(5, 2) + '/' +updatedDate.substr(8, 2);
                        }
                        _this.homeworks = resData;
                    })
            },
            initCourses(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/courses/limit/3', {headers: {'authorization': `${token}`}})
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
            },
            initOutSide(){
                var _this = this;
                var token = this.$store.getters.getToken;

                var path = this.$serverURL;
                if(this.userRole == 'student') path += '/api/students/out_lessons/limit/2';
                else path += '/api/guests/out_lessons/limit/3';

                axios.get(path, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        var resData = response.data;
                        console.log(resData);
                        for(var index in resData){
                            if(resData[index].book) resData[index].book.book_url = _this.$serverURL + resData[index].book.book_url;
                        }
                        _this.outbooks = resData;
                    })
            },
            goHomework(index){
                var work = this.homeworks[index]
                if(work.progress == 100) this.$router.push({path: '/homework/complete', query: {id: work.id, title: work.name}});
                else{
                    var current = Date.now();
                    var dead = new Date(work.deadline);
                    dead = dead.getTime();
                    if(current < dead) this.$router.push({path: '/homework/uncomplete', query: {id: work.id, title: work.name}});
                    else this.$router.push({path: '/homework/over', query: {id: work.id, title: work.name}});  
                }
            },
            goCourse(index){
                let course = this.courses[index];
                this.$router.push({path: '/course/unit', query: {id: course.id, name: course.name}})
            },
            goOutCourse(index){
                let outcourse = this.outbooks[index];
                this.$router.push({path: '/extracourse/extraview', query: {id: outcourse.id, name: outcourse.book.name}})
            }
        }
    }
</script>
<style>
    .pannel.bg-1{
        background-color: #D4E8FF;
    }
    .pannel .pannel-header .pannel-title{
        font-size: 36px;
        font-weight: bold;
        color: black;
        line-height: 48px;
    }
    .pannel .pannel-header .pannel-subtitle{
        font-size: 14px;
        line-height: 20px;
    }
    .pannel .book-thumb-1{
        height: 360px;
        width: 270px;
        border-radius: 12px;
    }
    .pannel .book-thumb-2{
        height: 200px;
        width: 150px;
        border-radius: 10px;
    }
    .pannel .btn_detail{
        border-radius: 12px;
        padding: 18px 64px;
        margin: 36px 0px 36px;
    }
</style>