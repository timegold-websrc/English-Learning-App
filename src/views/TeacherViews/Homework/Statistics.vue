<template>
    <ContentWrapper>
        <div class="card m-0 p-4">
            <div class="card-header d-flex fn-18 align-items-center">
                <div class="flex-row mr-auto fn-muted">
                    <router-link to="/teacher/homework" class="link-primary mr-1">作业</router-link> >  
                    <span @click="$router.go(-1)" class="link-primary cursor-pointer">{{workName}} > </span> 
                    <span v-if="isDetail" class="ml-1 link-primary cursor-pointer" @click="returnPage">作业统计 ></span>
                    <span class="ml-1">{{isDetail ? '详情' : '作业统计'}}</span>
                </div>
            </div>
            <div v-if="!isDetail">
                <div class="row mr-0 ml-0 fn-20 text-center">
                    <div v-for="(tab, index) in tabNames" :key="index"
                        class="col-md-3 bordered_tab_item fn-muted"
                        :class="selectedTabID == index ? 'active' : ''"
                        @click="selectTab(index)">{{tab}}
                    </div>
                </div>
                <table class="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th  rowspan="2" class="fn-18 fn-black fn-bold-none">{{tabNames[selectedTabID]}}</th>
                            <th  rowspan="2" v-if="!selectedTabID" class="fn-18 fn-black fn-bold-none">音标</th>
                            <th  rowspan="2" v-if="!selectedTabID" class="fn-18 fn-black fn-bold-none">翻译</th>
                            <th  rowspan="2" class="fn-18 fn-black fn-bold-none th-20-160">已读人数</th>
                            <th  rowspan="2" class="fn-18 fn-black fn-bold-none th-20-160">未读人数</th>
                            <th  colspan="4" class="fn-18 fn-black fn-bold-none">阶段得分人数</th>
                            <th  rowspan="2" class="fn-18 fn-black fn-bold-none">操作</th>
                        </tr>
                        <tr>
                            <th class="fn-12 fn-black fn-bold-none" style="padding: 5px">90~100</th>
                            <th class="fn-12 fn-black fn-bold-none" style="padding: 5px">80~90</th>
                            <th class="fn-12 fn-black fn-bold-none" style="padding: 5px">60~80</th>
                            <th class="fn-12 fn-black fn-bold-none" style="padding: 5px">60分以下</th>
                        </tr>
                    </thead>
                    <tbody class="fn-16">
                        <tr v-for="(item, index) in tmpData" :key="index">
                            <td  class="text-left">{{item.text}}</td>
                            <td v-if="!selectedTabID">/ə'laʊ/</td>
                            <td v-if="!selectedTabID">vt. 允许；给予；认可</td>
                            <td>{{item.read_count}}</td>
                            <td>{{item.unread_count}}</td>
                            <td>{{item.more_90}}</td>
                            <td>{{item.more_80}}</td>
                            <td>{{item.more_60}}</td>
                            <td>{{item.less_60}}</td>
                            <td class="fn-primary cursor-pointer" @click="viewDetail(index)">详情</td>
                        </tr>
                    </tbody>
                </table>

                <div class="mt-4 d-flex">
                    <b-pagination class="m-auto" :total-rows="sortList.length" v-model="currentPage" :per-page="10"></b-pagination>
                </div>
            </div>
            <div v-else>
                <table class="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th  class="fn-18 fn-black fn-bold-none">分数</th>
                            <th  class="fn-18 fn-black fn-bold-none">人数</th>
                            <th  class="fn-18 fn-black fn-bold-none">学生</th>
                        </tr>
                    </thead>
                    <tbody class="fn-16">
                        <tr>
                            <td>90(含)~100(含)</td>
                            <td>{{tmpData[selectedIndex].more_90}}</td>
                            <td class="fn-12 flex-wrap" :class="tmpData[selectedIndex].more_90 ? 'd-flex': ''">
                                <div v-for="(std, index) in studentResults[0]" :key="index" class="mr-3">
                                    <avatar username="" :size="52" :src="getAvatar(std.avatar_url)"/>
                                    <div>{{std.name}} ({{getMarks(std.student_results[0])}})</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>80(含)~90</td>
                            <td>{{tmpData[selectedIndex].more_80}}</td>
                            <td class="fn-12 flex-wrap" :class="tmpData[selectedIndex].more_80 ? 'd-flex': ''">
                                <div v-for="(std, index) in studentResults[1]" :key="index" class="mr-3">
                                    <avatar username="" :size="52" :src="getAvatar(std.avatar_url)"/>
                                    <div>{{std.name}} ({{getMarks(std.student_results[0])}})</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>60(含)~80</td>
                            <td>{{tmpData[selectedIndex].more_60}}</td>
                            <td class="fn-12 flex-wrap" :class="tmpData[selectedIndex].more_60 ? 'd-flex': ''">
                                <div v-for="(std, index) in studentResults[2]" :key="index" class="mr-3">
                                    <avatar username="" :size="52" :src="getAvatar(std.avatar_url)" />
                                    <div>{{std.name}} ({{getMarks(std.student_results[0])}})</div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>60分以下</td>
                            <td>{{tmpData[selectedIndex].less_60}}</td>
                            <td class="fn-12 flex-wrap" :class="tmpData[selectedIndex].less_60 ? 'd-flex': ''">
                                <div v-for="(std, index) in studentResults[3]" :key="index" class="mr-3">
                                    <avatar username="" :size="52" :src="getAvatar(std.avatar_url)"/>
                                    <div>{{std.name}} ({{getMarks(std.student_results[0])}})</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
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
                tabNames: ['单词', '句子', '段落', '文章'],

                statisticData: [],
                sortList: [],
                currentPage: 0,
                tmpData: [],
                selectedTabID: -1,

                isDetail: false,
                selectedIndex: -1,
                studentResults: []
            }
        },
        computed: {
        },
        watch: {
            currentPage: function(val){
                this.fliterPageData();
            }
        },
        mounted() {
            this.workID = this.$route.query.work;
            this.workName = this.$route.query.path;

            this.initStatisticData();
        },
        methods: {
            initStatisticData(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/statisticsInHomework/' + this.workID, {headers: {'authorization': `${token}`}})
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
                            
                            if(_data.type == 'word') _data.type = 0;
                            else if(_data.type == 'paragraph') _data.type = 2;
                            else if(_data.type == 'article') _data.type = 3;
                            else _data.type = 1;

                            _list.push(_data);
                        }
                        _this.statisticData = _list;
                        // console.log(_this.statisticData);
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
                for(var i in this.statisticData){
                    var _sentence = this.statisticData[i];
                     
                    if(index != _sentence.type) continue;
                    _list.push(_sentence);
                }
                this.sortList = _list;
                
                this.fliterPageData();
            },
            returnPage(){
                this.isDetail = false;
                this.selectedIndex = -1;
                this.studentResults = [];
            },
            viewDetail(index){
                this.isDetail = true;
                this.selectedIndex = index;
                var senID = this.tmpData[this.selectedIndex].sentence_id;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/resultsInHomeworkDetail/' + this.workID + '/' + senID, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        var resData = response.data;
                        var _more_90 = [], _more_80 = [], _more_60 = [], _less_60 = [];
                        for(var index in resData){
                            var _data = resData[index];
                            
                            if(!_data.student_results.length || !_data.student_results[0].marks) _less_60.push(_data);
                            else if(_data.student_results[0].marks >= 90) _more_90.push(_data);
                            else if(_data.student_results[0].marks >= 80) _more_80.push(_data);
                            else if(_data.student_results[0].marks >= 60) _more_60.push(_data);
                            else _less_60.push(_data);
                        }
                        _this.studentResults = [_more_90, _more_80, _more_60, _less_60];
                    })
            },
            getAvatar(uri){
                if(uri) return this.$serverURL + uri;
                else return 'img/user/dummy_user.png'
            },
            getMarks(result){
                if(!result || !result.marks) return 0;
                else return result.marks;
            },
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
