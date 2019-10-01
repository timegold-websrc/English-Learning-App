<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 
            <router-link to="/course" class="link-primary ml-1">课程</router-link> > 
            {{courseName}} > {{units.length ? units[selectedID].name : ''}}</p>
        <div class="row ml-2 mr-2">
            <div class="col-2 pr-4 pl-0">
                <div class="card fn-16 pt-3 pb-3">
                    <div v-for="(item, index) in units" :key="index" :class="selectedID == index ? 'active' : ''" @click="updateLessons(index)" class="unit">
                        {{item.name}}
                    </div>
                </div>
            </div>
            <div class="card col-10 fn-14 pt-4 pb-4 pl-4 pr-4">
                <div class="row page mt-3 mb-3 ml-0 mr-0" v-for="(item, index) in lessons" :key="index">
                    <div class="col-6">
                        
                        <router-link :to="{path:'/course/lesson', query: {paths: [courseName ,units[selectedID].name], id: item.id, name: item.name}}" title="" class="link-primary">
                            <p class="text-muted mb-4">{{item.updatedAt}}</p>
                            <p class="mb-0 fn-black"><img src="img/icons/play_stand.png" alt="record" class="icon-19 mr-2">{{item.name}}</p>
                        </router-link>
                    </div>
                    <div class="col-6 text-right">
                        <p v-if="item.status == 2" class="mb-0 fn-primary">已完成</p>
                        <p v-else-if="item.status == 1" class="mb-0 fn-danger">待学习</p>
                        
                        
                        <div v-if="item.status == 0" class="mt-4 read-time fn-12 border-mute">加油</div>
                        <div v-else-if="item.progress > 80" class="mt-2 read-time fn-12 border-success fn-success">{{item.progress}}分</div>
                        <div v-else-if="item.progress > 60" class="mt-2 read-time fn-12 border-warning fn-warning">{{item.progress}}分</div>
                        <div v-else class="mt-2 read-time fn-12  border-danger fn-danger">{{item.progress ? item.progress : 0}}分</div>
                    </div>
                </div>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    export default {
        data () {
            return {
                selectedID: 0,
                uId: null,
                courseName: null,
                units: [],
                lessons: []
            }
        },
        mounted() {
            this.courseId = this.$route.query.id;
            this.courseName = this.$route.query.name;
            this.initUnits();            
        },
        methods: {
            initUnits(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/units/' + this.courseId, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        _this.units = response.data;
                        _this.updateLessons(0);
                    })
            },
            updateLessons(uID){
                this.selectedID = uID;
                if(!this.units.length) return;
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/students/lessons/' + this.units[uID].id, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        let resData = response.data;
                        console.log(resData);
                        for(var index in resData){
                            resData[index].updatedAt = resData[index].updatedAt.replace('T', ' ').replace(/-/g, '/').slice(0, 16);
                            if(!resData[index].lesson_results.length) resData[index].status = 0;
                            else{
                                if(resData[index].lesson_results[0].completed_date) resData[index].status = 2;
                                else resData[index].status = 1;
                                
                                // resData[index].progress = resData[index].lesson_results[0].progress;
                            } 
                        }
                        _this.lessons = resData;
                    })
            }
        }
    }
</script>
<style>
    .unit{
        margin: 5px 0px;
        padding: 5px 5px 5px 40px;
        color: #909FA7;
        border-left: 2px solid transparent;
        cursor: pointer;
    }
    .unit.active{
        color: #0093ec;
        border-left: 2px solid #0093ec;
    }
    .page{
        padding: 10px;
        border-radius: 5px;
        box-shadow: 1px 1px 4px #dcdcdc, -1px 1px 4px #dcdcdc, -1px -1px 4px #dcdcdc;     
    }
    .page .read-time{
        width: 38px;
        float: right;
        text-align: center;
        border-radius: 50%;
        line-height: 36px;
    }
    
</style>