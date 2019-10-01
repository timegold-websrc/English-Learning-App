<template>
    <ContentWrapper>
        <div class="row m-0">
            <div class="col-lg-6 p-0 pr-2">
                <div class="card p-3 pb-3 pl-4 pr-4 border_1_muted">
                    <div class="row">
                        <div class="col-md-4 pr-3 pl-3">
                            <custom-select placeholdText="选择年级" :menus="gradeList" class="fn-14" @changeSelection="changedGrade"/>
                        </div>
                        <div class="col-md-4 pr-3 pl-3">
                            <custom-select placeholdText="选择班级" :menus="sortClasses" class="fn-14" @changeSelection="changedClass"/>
                        </div>
                        <div class="col-md-4 mt-1">
                            <router-link to="/teacher/homeworks">
                                <button type="button" class="btn fn-12 btn-outline-primary float-right">布置作业</button>
                            </router-link>
                        </div>
                    </div>
                </div>

                <div class="card border_1_muted">
                    <div class="d-flex align-items-center pr-4 pl-4 pt-3 pb-2">
                        <div class="flex-row mr-auto fn-20 fn-black">已发布作业</div>
                    </div>
                    <div v-for="(item, index) in homeworkList" :key="index" 
                        class="d-flex flex-center fn-18 border_t_1_muted pt-3 pb-3 cursor-pointer"
                        @click="viewHomeworkResults(index)">
                        <div>{{item.alias}}</div>
                        <button class="btn bage_btn"
                            style="box-shadow: unset"
                            :class="selectedWorkIndex == index? 'border-mute' : 'btn-outline-primary'"
                            @click="clickedRankBtn($event, index)">查看排行</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-6 p-0 pl-2">
                <div class="card fn-18 pt-3 pl-0 pr-0 mb-0">
                    <div class="tab-header  d-flex fn-18 ml-0 mr-0 pl-2 pr-2">
                        <div :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">总分排行</div>
                        <div :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">时间排行</div>
                    </div>
                    <div class="text-pan h-scroll pr-4 pl-4" style="height: 680px">
                        <div v-for="(item, index) in rankList" v-bind:key="index" class="d-flex pt-2 pb-2 mr-0 ml-0" >
                            <div class="flex-row mr-auto text-center">
                                <div class="d-flex">
                                    <div v-if="index < 3" class="rank mt-2">
                                        <img :src="'img/icons/rank_'+ (index+1) +'.png'" class="rank">
                                        <p class="mb-0 rank-num fn-12">{{index+1}}</p>
                                    </div>
                                    <div v-else class="rank fn-24 mt-2">{{index+1}}</div>
                                    <avatar username="白拫" :size="52" :src="item.avatar_url" class="mr-2"/>
                                    <div class="text-left mt-2">
                                        <p class="mb-0 mt-0 fn-18">{{item.name}}</p>

                                        <p v-if="!selectedTabID" class="mb-0 text-muted fn-12">{{item.completed_date}}</p>
                                        <p v-else class="mb-0 text-muted fn-12">得分{{item.marks}}分</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-row">
                                <div v-if="!selectedTabID">
                                    <div v-if="item.marks >= 80" class="border-circle border-success fn-14 ml-2 fn-success">{{item.marks}}分</div>
                                    <div v-else-if="item.marks >= 60" class="border-circle border-warning fn-14 ml-2 fn-warning">{{item.marks}}分</div>
                                    <div v-else class="border-circle border-danger fn-14 ml-2 fn-danger">{{item.marks}}分</div>
                                </div>
                                <div v-else>
                                    <div v-if="item.completed_date.length > 10" class="ml-2 mt-2 fn-info fn-16">{{item.completed_date}}</div>
                                    <div v-else class="ml-2 mt-2 fn-danger fn-16">{{item.completed_date}}</div>
                                </div>
                                    
                                    
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
    import CustomSelect from '@/components/Common/CustomSelect'
    export default {
        components: {
            Avatar,
            CustomSelect
        },
        data () {
            return {
                selectedGrade: null,
                selectedClass: null,
                gradeList: [],
                classList: [],

                rankList: [],
                selectedTabID: 0,
                selectedWorkIndex: -1,

                homeworkList: [],
            }
        },
        computed: {
            sortClasses: function(){
                var sortList = [];
                if(!this.selectedGrade) return sortList;
                else {
                    for(var index in this.classList){
                        if(this.selectedGrade.id == this.classList[index].grade_id) sortList.push(this.classList[index]);
                    }
                    return sortList;
                }
            }
        },
        mounted() {
            this.initHomeworkData();
            this.initGradeList();
            this.initClassList();
        },
        methods: {
            initHomeworkData(){
                var _this = this;
                var token = this.$store.getters.getToken;

                var _path = this.$serverURL;
                if(this.selectedClass) _path += '/api/teachers/homeworksInClass/' + this.selectedClass.id;
                else if(this.selectedGrade) _path += '/api/teachers/homeworksInGrade/' + this.selectedGrade.id;
                else _path += '/api/teachers/homeworks';

                axios.get(_path, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        console.log(response.data);
                        var resData = response.data;
                        
                        var _count = {}, item = null, itemCount = 0;
                        for(var i = 0; i < resData.length; i++){
                            item = resData[i];
                            itemCount = _count[item.name];
                            if(itemCount){
                                item['alias'] = item.name + '(' + itemCount + ')';
                                _count[item.name] += 1;
                            }else{
                                item['alias'] = item.name;
                                _count[item.name] = 1;
                            }
                        }
                        
                        _this.homeworkList = response.data;
                        if(_this.homeworkList.length){
                            _this.selectedWorkIndex = 0;
                            _this.updateLeaderboard();
                        }else {
                            _this.selectedWorkIndex = -1;
                            _this.rankList = [];
                        }
                    })
            },
            updateLeaderboard(){
                var _workID = this.homeworkList[this.selectedWorkIndex].id;
                var _classID = this.selectedClass ? this.selectedClass.id : 0;

                var _this = this;
                var token = this.$store.getters.getToken;
                
                var _path = this.$serverURL;
                if(this.selectedTabID == 0) _path += '/api/teachers/progress_ranking/' + _classID + '/' + _workID;
                else _path += '/api/teachers/date_ranking/' + _classID + '/' + _workID;

                axios.get(_path, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        // console.log(response.data);
                        var resData = response.data;
                        _this.rankList = [];

                        for(var i = 0; i < resData.length; i++){
                            var _res = resData[i];
                            var _data = {id: _res.id, name: _res.name};
                            _data['avatar_url'] = _res.avatar_url ? _this.$serverURL + _res.avatar_url : 'img/user/dummy_user.png';
                            if(_res.homework_results.length){
                                _data['marks'] = _res.homework_results[0].avg_marks ? _res.homework_results[0].avg_marks : 0;
                                _data['completed_date'] = _res.homework_results[0].completed_date;
                                if(_data.completed_date) _data.completed_date = _data.completed_date.substr(0, 16) + _data.completed_date.substr(19);
                                else _data.completed_date = '待完成';
                            }else{
                                _data['marks'] = 0;
                                _data['completed_date'] = '待完成';
                            }
                            _this.rankList.push(_data);
                        }
                    })
            },
            clickedRankBtn(e, index){
                e.stopPropagation();

                if(this.selectedWorkIndex == index) return;
                this.selectedWorkIndex = index;
                this.updateLeaderboard();
            },
            initGradeList(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/grades', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        // console.log(response.data);
                        _this.gradeList = response.data;
                    })
            },
            initClassList(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/teachers/classes', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        // console.log(response.data);
                        _this.classList = response.data;
                    })
            },
            changedGrade(item){
                if(this.selectedGrade == item) return;
                this.selectedGrade = item;
                this.selectedClass = null;
                this.initHomeworkData();
            },
            changedClass(item){
                if(this.selectedClass == item) return;
                this.selectedClass = item;
                this.initHomeworkData();
            },
            selectTab(id){
                if(this.selectedTabID == id) return;
                this.selectedTabID = id;
                this.updateLeaderboard();
            },
            viewHomeworkResults(index){
                var _work = this.homeworkList[index];
                var _deadline = new Date(_work.deadline).getTime();
                var _isEnded = _deadline > Date.now() ? false : true;
                
                this.$router.push({path: '/teacher/homework/homework_results', query: {isEnded: _isEnded, id: _work.id, name: _work.name}});
            }
        }
    }
</script>
<style>
    .tab-header{
        border-bottom: 2px solid #efecec;        
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
    .bage_btn{
        position: absolute;
        right: 0;
        margin-right: 16px;
    }
</style>