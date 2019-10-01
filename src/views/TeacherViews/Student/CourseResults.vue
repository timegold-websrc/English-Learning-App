<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18 align-items-center">
                <div class="flex-row mr-auto">
                    <router-link to="/teacher/student" class="link-primary">学生</router-link> > 
                    <span class="cursor-pointer">课程学习情况</span>
                </div>
                <div class="d-flex align-items-center">
                    <avatar username="" :size="38" :src="std_avatar" class="mr-2"/>
                    <div class="ml-1">{{std_name}}</div>
                </div>
            </div>
            <div class="row mr-0 ml-0 fn-20 text-center">
                <div v-for="(tab, index) in tabNames" :key="index"
                    class="col-md-3 bordered_tab_item fn-muted"
                    :class="selectedTabID == index ? 'active' : ''"
                    @click="selectTab(index)">{{tab}}</div>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">已读{{tabNames[selectedTabID]}}</th>
                        <th  class="fn-18 fn-black fn-bold-none th-20-160">时间</th>
                        <th  class="fn-18 fn-black fn-bold-none th-15-60">分数</th>
                        <th  class="fn-18 fn-black fn-bold-none th-15-60">详情</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="text-left">{{item.sentence.text}}</td>
                        <td>{{item.time}}</td>
                        <td >{{item.marks}}</td>
                        <td class="fn-primary cursor-pointer" @click="viewResult(index)">查看</td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="selectedList.length" v-model="currentPage" :per-page="10"></b-pagination>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _SENTENCE = 0;
    const _WORD = 1;
    const _ARTICLE = 2;
    import axios from 'axios';
    import Avatar from '@/components/Common/Avatar';
    export default {
        components: {
            Avatar
        },
        data () {
            return {
                std_name : '',
                std_avatar: '',

                tabNames: ['单词', '句子', '段落', '文章'],
                wordList: [],
                sentenceList: [],
                paragList: [],
                articleList: [],

                currentPage: 0,
                tmpData: [],
                selectedTabID: 0,
                selectedList: []
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.studentID = this.$route.query.id;
            this.std_name = this.$route.query.name;
            this.std_avatar = this.$route.query.avatar ? this.$serverURL + this.$route.query.avatar : 'img/user/dummy_user.png';

            this.initCourseData();
        },
        methods: {
            initCourseData(){
                this.articleList = [];
                this.wordList = [];
                this.sentenceList = [];

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/viewCourseResults/' + this.studentID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }
                        var resData = response.data;
                        // console.log(resData);
                        for(var i = 0; i < resData.length; i++){
                            var _time = resData[i].updatedAt;
                            resData[i].time = _time.substr(0, 4)+ '.'+ _time.substr(5, 2)+ '.'+_time.substr(8, 2)+ '  '+_time.substr(11, 2)+ '.'+_time.substr(14, 2);

                            if(resData[i].sentence.type == 'article') _this.articleList.push(resData[i]);
                            else if(resData[i].sentence.type == 'paragraph') _this.paragList.push(resData[i]);
                            else if(resData[i].sentence.type == 'word') _this.wordList.push(resData[i]);
                            else _this.sentenceList.push(resData[i]);
                        }
                        
                        _this.selectTab(0);
                    })
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.selectedList.slice(offset, offset + 10);
            },
            selectTab(index){
                this.selectedTabID = index;
                if(this.selectedTabID == 0) this.selectedList = this.wordList;
                else if(this.selectedTabID == 2) this.selectedList = this.paragList;
                else if(this.selectedTabID == 3) this.selectedList = this.articleList;
                else this.selectedList = this.sentenceList;

                this.currentPage = 1;
                this.fliterPageData();
            },
            viewResult(index){
                this.$router.push({path:'/teacher/result_details', query: {id: this.tmpData[index].id}});
            }
        }
    }
</script>
<style>
    .bordered_tab_item{
        line-height: 46px;
        border: 1px solid #F0F0F0;
        border-bottom: 0px;
        cursor: pointer;
    }
    .bordered_tab_item.active{
        background-color: #5C99E1;
        border: 1px solid #5C99E1;
        color: white!important;
    }
</style>
