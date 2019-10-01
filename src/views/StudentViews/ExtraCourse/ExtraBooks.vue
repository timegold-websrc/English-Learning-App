<template>
    <ContentWrapper>
        <p class="text-muted ml-2 fn-14">当前位置: 课外阅读</p>
        <div class="card ml-2 mr-2">
            <div class="card-body pr-5 pl-5">
                <div v-for="(item, index) in outsidebooks" v-bind:key="index" class="course-item pt-3 pb-3 mr-0 ml-0" >
                    <div class="d-flex">
                        <div class="book-thumb-2 mr-4">
                            <img class="book-thumb-2" :src="item.book.book_url" alt="Image" />
                        </div>
                        <div class="text-left">
                            <p class="mb-0 mt-1 fn-24 fn-black">{{item.book.name}}</p>
                            <p class="mb-0 mt-0 fn-20">{{item.book.author}}</p>
                            <p class="mb-0 mt-1 fn-14 text-muted">{{item.book.description}}</p>
                            <router-link :to="{path: '/extracourse/extraview', query: {id: item.id, name: item.book.name}}">
                                <button type="button" class="btn btn-primary fn-20 pl-5 pr-5 mt-2">详情</button>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="text-center text-muted fn-28">
           — 没有更多课程了哦 —
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    export default {
        data () {
            return {
                outsidebooks: []
            }
        },
        mounted() {
            this.initOutsideHomework();
        },
        methods: {
            initOutsideHomework(){
                var _this = this;
                var token = this.$store.getters.getToken;
                var userRole = this.$store.getters.getRole;

                var path = this.$serverURL;
                if(userRole == 'student') path += '/api/students/out_lessons';
                else path += '/api/guests/out_lessons';

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

                        _this.outsidebooks = resData;
                    })
            }
        }
    }
</script>
<style>
    .course-item{
        border-bottom: 2px solid #d2d2d2;
    }
</style>