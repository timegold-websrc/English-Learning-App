<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18 align-items-center">
                <div class="flex-row mr-auto fn-muted">
                    <router-link to="/teacher/homework" class="link-primary mr-1">作业</router-link> >  
                    <span @click="$router.go(-1)" class="link-primary cursor-pointer">{{workName}} > </span> 
                    <span class="ml-1">{{currentPageType}}</span>
                </div>
                <div v-if="stdInfo" class="d-flex align-items-center">
                    <avatar username="" :size="38" :src="getStdAvatar" class="mr-2"/>
                    <div class="ml-1">{{stdInfo.name}}</div>
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
                        <th  class="fn-18 fn-black fn-bold-none">{{pageType ? '已读' : '未读'}}{{tabNames[selectedTabID]}}</th>
                        <th  v-if="!selectedTabID" class="fn-18 fn-black fn-bold-none">音标</th>
                        <th  v-if="!selectedTabID" class="fn-18 fn-black fn-bold-none">翻译</th>
                        <th  class="fn-18 fn-black fn-bold-none th-20-160">时间</th>
                        <th  class="fn-18 fn-black fn-bold-none">分数</th>
                        <th  class="fn-18 fn-black fn-bold-none">详情</th>
                    </tr>
                </thead>
                <tbody v-if="pageType" class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td  class="text-left">{{item.text}}</td>
                        <td v-if="!selectedTabID">/ə'laʊ/</td>
                        <td v-if="!selectedTabID">vt. 允许；给予；认可</td>
                        <td>{{item.student_results[0].updatedAt}}</td>
                        <td >{{item.student_results[0].marks}}</td>
                        <td class="fn-primary cursor-pointer" @click="viewResult(index)">查看</td>
                    </tr>
                </tbody>
                <tbody v-else class="fn-16">
                    <tr v-for="(item, index) in tmpData" :key="index">
                        <td class="text-left">{{item.text}}</td>
                        <td v-if="!selectedTabID">/ə'laʊ/</td>
                        <td v-if="!selectedTabID">vt. 允许；给予；认可</td>
                        <td class="fn-danger">未读</td>
                        <td>0</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
            <div class="mt-4 d-flex">
                <b-pagination class="m-auto" :total-rows="sortList.length" v-model="currentPage" :per-page="10"></b-pagination>
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
                pageType: 2,
                stdInfo: null,
                tabNames: ['单词', '句子', '段落', '文章'],

                sentenceList: [],
                sortList: [],
                currentPage: 0,
                tmpData: [],
                selectedTabID: -1
            }
        },
        computed: {
            currentPageType: function(){
                if(this.pageType == 2) return '已完成详情';
                else if(this.pageType == 1) return '已读详情';
                else return '未读详情';
            },
            getStdAvatar: function(){
                if(this.stdInfo.avatar) return this.$serverURL + this.stdInfo.avatar;
                else return 'img/user/dummy_user.png';
            }
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.workID = this.$route.query.work;
            this.workName = this.$route.query.path;
            this.pageType = this.$route.query.type;
            this.stdInfo = {
                id: this.$route.query.s_id,
                name: this.$route.query.s_name,
                avatar: this.$route.query.s_avatar
            }

            this.initResultData();
        },
        methods: {
            initResultData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/studentResultsInHomework/' + this.workID + '/'+ this.stdInfo.id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        var resData = response.data;
                        var _list = [];
                        for(var index in resData){
                            var _data = resData[index];
                            if(_this.pageType && (!_data.student_results.length || !_data.student_results[0].marks)) continue;
                            else if(!_this.pageType && _data.student_results.length && _data.student_results[0].marks) continue;
                            
                            if(_data.type == 'wd') _data.type = 0;
                            else if(_data.type == 'pg') _data.type = 2;
                            else if(_data.type == 'at') _data.type = 3;
                            else _data.type = 1;

                            if(_data.student_results.length) 
                                _data.student_results[0].updatedAt = _data.student_results[0].updatedAt.replace(/-/g, '.').replace('T', ' ').substr(0, 16);
                            
                            _list.push(_data);
                        }
                        _this.sentenceList = _list;
                        // console.log(_this.sentenceList);
                        _this.selectTab(0);
                    })
                
            },
            fliterPageData(){
                var offset = (this.currentPage - 1) * 10;
                this.tmpData = this.sortList.slice(offset, offset + 10);
            },
            selectTab(index){
                if(this.selectedTabID == index) return;
                this.selectedTabID = index;
                this.currentPage = 1;

                var _list = [];
                for(var i in this.sentenceList){
                    var _sentence = this.sentenceList[i];
                     
                    if(index != _sentence.type) continue;
                    _list.push(_sentence);
                }
                this.sortList = _list;
                
                this.fliterPageData();
            },
            viewResult(index){
                console.log(this.tmpData);
                this.$router.push({path:'/teacher/result_details', query: {id: this.tmpData[index].student_results[0].id}});
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
