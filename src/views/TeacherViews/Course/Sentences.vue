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
                    <span v-if="pathInfo" class="cursor-pointer">{{pathInfo.lesson_name}}</span> 
                </div>
                <button v-if="isPublished" type="button" class="fn-muted flex-row btn btn-outline-secondary">添加内容</button>
                <button v-else type="button" class="flex-row btn btn-outline-primary" @click="addContent">添加内容</button>
            </div>
            <div class="row mr-0 ml-0 fn-20 text-center">
                <div v-for="(tab, index) in tabNames" :key="index" class="col-md-3 bordered_tab_item" :class="selectedTabID == index ? 'active' : ''" @click="selectTab(index)">{{tab}}</div>
            </div>
            <table class="table table-bordered text-center">
                <thead>
                    <tr>
                        <th  class="fn-18 fn-black fn-bold-none">{{tabNames[selectedTabID]}}</th>
                        <th  v-if="selectedTabID == 0" class="fn-18 fn-black fn-bold-none">音标</th>
                        <th  v-if="selectedTabID == 0" class="fn-18 fn-black fn-bold-none">翻译</th>
                        <th  class="fn-18 fn-black fn-bold-none ">总浏览数</th>
                        <th  class="fn-18 fn-black fn-bold-none ">总平均分</th>
                    </tr>
                </thead>
                <tbody class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="text-left">{{item.text}}</td>
                        <td v-if="selectedTabID == 0">{{item.symbol ? item.symbol : '--'}}</td>
                        <td v-if="selectedTabID == 0">{{item.trans ? item.trans : '--'}}</td>
                        <td>{{item.exp_count}}</td>
                        <td>{{Math.round(item.avg_marks)}}</td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="TotalPages" v-model="currentPage" :per-page="10"></b-pagination>
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
                isPublished: false,
                sentenceList: [],
                wordList: [],
                paragList: [],
                articleList: [],

                unitList: [],
                currentPage: 0,
                tmpData: [],
                selectedTabID: 0,

                pathInfo: null,

                tabNames: ['单词', '句子', '段落', '文章']
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        computed: {
            TotalPages: function(){
                if(this.selectedTabID == 0) return this.wordList.length;
                else if(this.selectedTabID == 1) return this.sentenceList.length;
                else if(this.selectedTabID == 2) return this.paragList.length;
                else return this.articleList.length;
            }
        },
        mounted() {
            this.pathInfo = this.$route.query;
            if(!this.pathInfo || !this.pathInfo.course_id || !this.pathInfo.course_name 
                || !this.pathInfo.unit_id || !this.pathInfo.unit_name 
                || !this.pathInfo.lesson_id || !this.pathInfo.lesson_name) {
                    this.$router.go(-1);
            }

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
                        
                        var resData = response.data;
                        _this.isPublished = resData.ispublished ? true : false;
                        resData = resData.contents;
                        console.log(resData);
                        for(var i = 0; i < resData.length; i++){
                            if(resData[i].type == 'article') _this.articleList.push(resData[i]);
                            else if(resData[i].type == 'paragraph') _this.paragList.push(resData[i]);
                            else if(resData[i].type == 'word') _this.wordList.push(resData[i]);
                            else _this.sentenceList.push(resData[i]);
                        }
                        _this.selectTab(0);
                    })
            },
            selectTab(index){
                this.selectedTabID = index;
                this.currentPage = 0;
                this.fliterPageData();
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                var _list = [];

                if(this.selectedTabID == 0) _list = this.wordList;
                else if(this.selectedTabID == 1) _list = this.sentenceList;
                else if(this.selectedTabID == 2) _list = this.paragList;
                else _list = this.articleList;

                this.tmpData = _list.slice(offset, offset + 10);
            },
            addContent(){
                this.$router.push({path:'/teacher/course/edit_sentences', query: this.pathInfo});
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
        color: white;
    }
</style>
