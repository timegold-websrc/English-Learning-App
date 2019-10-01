<template>
    <ContentWrapper>
        <div class="row">
            <div class="col-xl-3 col-md-6">
                <div class="card flex-row align-items-center align-items-stretch border-0">
                    <div class="col-4 d-flex align-items-center bg-primary-dark justify-content-center rounded-left">
                        <!-- <img src="/img/menuIcons/course_active.png" class="icon-width-28 mr-3"> -->
                        <!-- <em class="fa fa-book-open fa-3x"></em> -->
                        <em class="fab fa-leanpub fa-3x"></em>
                    </div>
                    <div class="col-8 py-3 bg-primary rounded-right">
                        <div class="h2 mt-0">40</div>
                        <div class="text-uppercase fn-18">课程</div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-md-6">
                <div class="card flex-row align-items-center align-items-stretch border-0">
                    <div class="col-4 d-flex align-items-center bg-purple-dark justify-content-center rounded-left">
                        <em class="fa fa-book fa-3x"></em>
                    </div>
                    <div class="col-8 py-3 bg-purple rounded-right">
                        <div class="h2 mt-0">60</div>
                        <div class="text-uppercase fn-18">教材</div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-12">
                <div class="card flex-row align-items-center align-items-stretch border-0">
                    <div class="col-4 d-flex align-items-center bg-green-dark justify-content-center rounded-left">
                        <em class="fa fa-users fa-3x"></em>
                    </div>
                    <div class="col-8 py-3 bg-green rounded-right">
                        <div class="h2 mt-0">15</div>
                        <div class="text-uppercase fn-18">班级</div>
                    </div>
                </div>
            </div>
            <div class="col-xl-3 col-lg-6 col-md-12">
                <div class="card flex-row align-items-center align-items-stretch border-0">
                    <div class="col-4 d-flex align-items-center bg-warning-dark justify-content-center rounded-left">
                        <em class="fa fa-user-graduate fa-3x"></em>
                    </div>
                    <div class="col-8 py-3 bg-warning rounded-right">
                        <div class="h2 mt-0">500</div>
                        <div class="text-uppercase fn-18">学生</div>
                    </div>
                </div>
            </div>
        </div>


        <div class="card m-0 pt-3 pb-3 pl-4 pr-4">
            <div class="row">
                <div class="col-lg-3 pr-3 pl-3">
                    <custom-select placeholdText="选择年级" :menus="grades" class="fn-14" @changeSelection="selectCourse"/>
                </div>
                <div class="col-lg-3 pr-3 pl-3"><custom-select placeholdText="选择班级" :menus="classes" class="fn-14"/></div>
                <div class="col-lg-3 pr-3 pl-3"><custom-select placeholdText="选择课程" :menus="courseList" class="fn-14"/></div>
                <div class="col-lg-3 pr-3 pl-3"><custom-select placeholdText="选择单元" :menus="lessonList" class="fn-14"/></div>
            </div>
        </div>
        <div class="row mr-0 ml-0 mt-4">
            <div class="col-lg-6 pr-3 pl-0">
                <div class="card p-0 mb-0">
                    <div class="card-header d-flex align-items-center">
                        <div class="mr-auto">
                            <span class="link-primary cursor-pointer fn-18 graph-type" :class="analType == 0 ? 'active' : ''" @click="changeAnalType(0)">分</span>
                            <span class="seperator fn-12" style="border-left: 2px solid #9E9E9E; margin: 0px 10px"></span>
                            <span class="link-primary cursor-pointer fn-18 graph-type"  :class="analType == 1 ? 'active' : ''" @click="changeAnalType(1)">准确率</span>
                        </div>
                        <toggle-btn
                            :value="true"
                            :sync="true"
                            :labels="{checked: '周', unchecked: '月'}"
                            :fontSize="18"
                            :width="60"
                            :height="30"
                            :color="{checked: '#00000099', unchecked: '#00000099'}"
                            @change="changeDateRange($event)"/>
                    </div>
                    <div class="card-body border_t_2_muted p-0">
                        <admin-chart 
                            style="height: 420px; width: 100%"
                            :unit="analType ? '%' : '分'"
                            :labels="graphLabels"
                            :datas="graphDatas"/>
                    </div>
                    <div class="d-flex fn-16 align-items-center" style="padding: 10px 15px">
                        <div class="back-info p-2 mr-1"></div><div>{{indexLabels[analType][0]}}</div>
                        <div class="back-warning p-2 ml-2 mr-1"></div><div>{{indexLabels[analType][1]}}</div>
                        <div class="back-danger p-2 ml-2 mr-1"></div><div>{{indexLabels[analType][2]}}</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 pl-0 pr-0">
                <div class="card fn-18 pt-3 pl-0 pr-0 mb-0" style="height: 100%;">
                    <div class="tab-header  d-flex fn-18 ml-0 mr-0 pl-2 pr-2">
                        <div :class="selectedTabID == 0 ? 'active' : ''" @click="selectTab(0)">总分排行</div>
                        <div :class="selectedTabID == 1 ? 'active' : ''" @click="selectTab(1)">时间排行</div>
                    </div>
                    <div class="pr-4 pl-4">
                        <div v-for="(item, index) in rankList" v-bind:key="index" class="d-flex pt-2 pb-2 mr-0 ml-0" >
                            <div class="flex-row mr-auto text-center">
                                <div class="d-flex">
                                    <div v-if="index < 3" class="rank mt-2">
                                        <img :src="'img/icons/rank_'+ (index+1) +'.png'" alt="record" class="rank">
                                        <p class="mb-0 rank-num fn-12">{{index+1}}</p>
                                    </div>
                                    <div v-else class="rank fn-24 mt-2">{{index+1}}</div>
                                    <avatar username="白拫" :size="52" :src="item.avatar" class="mr-2"/>
                                    <div class="text-left mt-2">
                                        <p class="mb-0 mt-0 fn-18">{{item.s_name}}</p>

                                        <p v-if="!selectedTabID" class="mb-0 text-muted fn-12">{{item.complete}}</p>
                                        <p v-else class="mb-0 text-muted fn-12">得分{{item.progress}}分</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-row">
                                    <div v-if="!selectedTabID" class="border-circle border-success fn-14 ml-2 fn-success">{{item.progress}}分</div>
                                    <div v-else class="ml-2 mt-2 fn-info fn-16">{{item.complete}}</div>
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
    import ToggleBtn from '@/components/Common/ToggleBtn'
    import AdminChart from '@/components/Common/AdminChart'
    export default {
        components: {
            Avatar,
            CustomSelect,
            ToggleBtn,
            AdminChart
        },
        data () {
            return {
                rankList: [],
                selectedTabID: 0,
                analType: 0,
                dateType: 'week',
                graphLabels: [],
                graphDatas: [],
                indexLabels: [['句子', '段落', '文章'], ['口音', '语调', '发音']],

                grades: [{id: 1, name: '一年级'}, {id: 1, name: '二年级'}, {id: 1, name: '二年级'}],
                classes: [{id: 1, name: '一班级'}, {id: 1, name: '二班级'}, {id: 1, name: '三班级'}],
                courseList: [],
                lessonList: []
            }
        },
        created() {
            var tRole = this.$store.getters.getRole;
            // if(tRole == 'admin') this.$router.push('/teacher/course');
            // this.$router.push('/teacher/course');
        },
        mounted() {
            this.rankList = [
                    {id: 1, avatar: "img/user/01.jpg", s_name: '黄同学', complete: '03/27 24: 00: 00 上交', progress: 90},
                    {id: 2, avatar: "img/user/02.jpg", s_name: '张同学', complete: '03/27 24: 00: 00 上交', progress: 80},
                    {id: 3, avatar: "img/user/03.jpg", s_name: '李同学', complete: '03/27 24: 00: 00 上交', progress: 70},
                    {id: 4, avatar: "img/user/04.jpg", s_name: '黄同学', complete: '03/27 24: 00: 00 上交', progress: 70},
                    {id: 5, avatar: "img/user/05.jpg", s_name: '张同学', complete: '03/27 24: 00: 00 上交', progress: 60},
                    {id: 6, avatar: "img/user/06.jpg", s_name: '黄同学', complete: '03/27 24: 00: 00 上交', progress: 60},
                    {id: 7, avatar: "img/user/08.jpg", s_name: '张同学', complete: '03/27 24: 00: 00 上交', progress: 60},
                    {id: 8, avatar: "img/user/09.jpg", s_name: '黄同学', complete: '03/27 24: 00: 00 上交', progress: 60}
                ];
            this.updateGraphData();
            this.initSortKeys();
        },
        methods: {
            initSortKeys(){
                var _this = this;
                var token = this.$store.getters.getToken;
                
                axios.get(this.$serverURL + '/api/teachers/course_unit_lesson_relation', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/teacher/login');
                            console.log(response.data.error);
                            return;
                        }

                        var resData = response.data;
                        let courseList = [];
                        let lessonList = [];
                        for(var i = 0; i < resData.length; i++){
                            var _course = resData[i];
                            courseList.push({id: _course.id, name: _course.name, lessons: []});
                            for(var j = 0; j < _course.units.length; j++){
                                var _unit = _course.units[j];
                                for(var k = 0; k < _unit.lessons.length; k++){
                                    var _lesson = _unit.lessons[k];
                                    var _lesson = {
                                        id: _lesson.id,
                                        r_name: _lesson.name,
                                        unit_id: _unit.id,
                                        course_id: _course.id,
                                        name: _unit.name + '-' + _lesson.name
                                    }
                                    lessonList.push(_lesson);
                                    courseList[i].lessons.push(_lesson);
                                }
                            }
                        }
                        _this.courseList = courseList;
                        _this.lessonList = lessonList;
                        console.log(courseList);
                        console.log(lessonList);
                    })
            },
            updateGraphData(){
                let curDate = new Date();
                let _year = curDate.getFullYear();
                let _month = curDate.getMonth() + 1;
                let _week = curDate.getDay();
                let _day = curDate.getDate();

                if(this.dateType == 'week') {
                    let _firstWeekDay = _day - _week + 1;
                    this.graphLabels = [ _month +'月'+ _firstWeekDay, _firstWeekDay + 1, _firstWeekDay + 2, _firstWeekDay + 3, _firstWeekDay + 4, _firstWeekDay + 5, _firstWeekDay + 6];
                } else {
                    let _lastMonthDaay = new Date(_year, _month, 0).getDate();
                    this.graphLabels = [_month + '月1', '6', '11', '16', '21', '26', _lastMonthDaay];
                }

                this.graphDatas = [];
                for(var i = 0; i < 3 ; i++){
                    var dataArray = [];
                    for(var j = 0; j < this.graphLabels.length; j++){
                        dataArray.push( Math.round(Math.random() * 40 + 40));
                    }
                    this.graphDatas.push(dataArray);
                }
            },
            selectCourse(item){
                console.log(item);
            },
            selectTab(id){
                this.selectedTabID = id;
            },
            changeDateRange(e){
                if(e.value) this.dateType = 'week';
                else this.dateType = 'month';

                this.updateGraphData();
            },
            changeAnalType(val){
                this.analType = val;
                this.updateGraphData();
            },
            
        }
    }
</script>
<style>
    .back-info{
        background-color: #5C99E1;
    }
    .back-warning{
        background-color: #D2910E;
    }
    .back-danger{
        background-color: #FF0404;
    }
    .graph-type.active{
        color: #5C99E1;
    }


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
</style>