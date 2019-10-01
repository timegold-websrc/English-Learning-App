<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 错词本</p>
        <div class="card ml-2 mr-2 p-2">
            <div class="d-flex">
                <router-link to="/collection" title="Collection">
                    <button type="button" class="btn btn-oval btn-outline-secondary fn-14 pt-1 pb-1 text-muted">收藏本</button>
                </router-link>
                <button type="button" class="btn btn-oval btn-primary fn-14 pt-1 pb-1 ml-4" >错词本</button>
            </div>
        </div>
        <div class="d-flex ml-2 mr-2 justify-content-center">
            <div ref="roadMap" class="road-map pr-0 pl-0 mr-4">
                <img class="back" src="/img/icons/road_map.png" alt="">
                <img class="start-btn" src="/img/icons/start.png" :style="markStyle('startBtn', 0)" alt="">
                <div v-for="(lesson, index) in this.roadMapData" :key="index">
                    <router-link v-if="lesson.status" 
                        :to="{path: '/collection/review/lesson', query: {level: index+1, name: lesson.lesson}}"
                        :title="lesson.lesson">
                        <img v-if="lesson.status == 1" src="/img/icons/pet.png" :style="markStyle('pet', index)">
                        <img v-else src="/img/icons/levelFlag.png" :style="markStyle('flag', index)">
                    </router-link>
                    <img v-else  src="/img/icons/mute.png"  :style="markStyle('lock', index)">
                    <div :style="markStyle('label', index)" class="marker-name">{{lesson.lesson}}</div>
                </div>
            </div>
            <div class="chart-map">
                <img class="back" src="/img/icons/back.png" alt="">
                <div class="chart-header d-flex">
                    <div class="flex-row mr-auto">单词量</div>
                    <div class="flex-row">最近复习：<span class="ml-2">60</span>单词</div>
                </div>
                <canvas ref="chartCanvas" id="chart-canvas"></canvas>
                <router-link v-for="(marker, index) in graphPoints"
                        :key="index"
                        :to="{path: '/collection/review/range', query: {level: index + 1, name: graphLabels[index]}}"
                        :title="graphLabels[index]"
                        :style="'top:'+ (marker.y - 7) + 'px; left: ' + (marker.x - 7) + 'px'"
                        class="marker">
                </router-link>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    import axios from 'axios';
    export default {
        data () {
            return {
                roadMapScale: 1,
                roadMapData: [],
                petInfo: {h: 56, x: -20, y: 14},
                lockInfo: {h: 44, x: 4, y: 6},
                flagInfo: {h: 52, x: 22, y: 22},
                labelInfo: {x: -15, y: -36},
                steps: [
                    {x: 608, y: 126},
                    {x: 140, y: 266},
                    {x: 650, y: 666},
                    {x: 56, y: 906},
                    {x: 394, y: 1078},
                    {x: 668, y: 1196}
                ],
                graphLabels: ['1天内', '3天内', '7天内', '14天内', '1个月内'],
                graphPoints: []
            }
        },
        computed: {
        },
        mounted() {
            this.roadMapData = [
                {lesson: '一单元', status: 0},
                {lesson: '二单元', status: 0},
                {lesson: '三单元', status: 0},
                {lesson: '四单元', status: 0},
                {lesson: '五单元', status: 0},
                {lesson: '六单元', status: 0}
            ];
            var _height = this.$refs.roadMap.clientHeight;
            this.roadMapScale = _height/1334;
            this.$refs.chartCanvas.height = _height;
            this.$refs.chartCanvas.width = 1578 * this.roadMapScale;
            
            this.initReviewData();
        },
        methods: {
            initReviewData: function(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/collections/game_levels', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        console.log(resData);
                        for(var i = 0; i < resData.length; i++){
                            if(resData[i].progress == 100 && resData[i].avg_marks >= 80) _this.roadMapData[i].status = 2;
                            else {
                                _this.roadMapData[i].status = 1;
                                break;
                            }
                        }
                    })
                
                axios.get(this.$serverURL + '/api/collections/wrong_collection_levels', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var resData = response.data;
                        var points = [];
                        var t_count = 0;
                        for(var i = 0; i < resData.length; i++){
                            t_count += resData[i].count;
                            points.push(resData[i].count);
                        }
                        
                        if(t_count){
                            for(var index in points){
                                points[index] = 100 * points[index] / t_count;
                            }
                        }
                        _this.drawGragh(points);
                    })
            },
            
            markStyle: function(type, index){
                const style = {position: 'absolute', cursor: 'pointer'};
                if(type == 'startBtn'){
                    style.height = 60 * this.roadMapScale + 'px';
                    style.bottom = 30 * this.roadMapScale + 'px';
                    style.right = 50 * this.roadMapScale + 'px';
                }else if(type == 'pet'){
                    style.height = (this.petInfo.h * this.roadMapScale) + 'px';
                    style.bottom = (this.steps[index].y + this.petInfo.y)* this.roadMapScale + 'px';
                    style.left = (this.steps[index].x + this.petInfo.x)* this.roadMapScale + 'px';
                }else if(type == 'lock'){
                    style.height = (this.lockInfo.h * this.roadMapScale) + 'px';
                    style.bottom = (this.steps[index].y + this.lockInfo.y)* this.roadMapScale + 'px';
                    style.left = (this.steps[index].x + this.lockInfo.x)* this.roadMapScale + 'px';
                }else if(type == 'flag'){
                    style.height = (this.flagInfo.h * this.roadMapScale) + 'px';
                    style.bottom = (this.steps[index].y + this.flagInfo.y)* this.roadMapScale + 'px';
                    style.left = (this.steps[index].x + this.flagInfo.x)* this.roadMapScale + 'px';
                }else{
                    style.bottom = (this.steps[index].y + this.labelInfo.y)* this.roadMapScale + 'px';
                    style.left = (this.steps[index].x + this.labelInfo.x)* this.roadMapScale + 'px';
                }

                return style;
            },
            drawGragh(data){
                if(!data.length) return;
                
                var _canvas = document.getElementById("chart-canvas");
                var height = _canvas.height;
                var width = _canvas.width;
                var _ctx = _canvas.getContext("2d");

                var origin = {x: 28, y: height - 55};
                var step = {x: Math.round((width - 56)/4), y: Math.round((height-130))};
                
                _ctx.fillStyle = "#ffffff8a";
                _ctx.font = "18px Arial";
                

                _ctx.beginPath(); 
                _ctx.moveTo(10,height/2);
                _ctx.lineTo(width - 60,height/2);
                _ctx.fillText('50%', width - 50, height/2 + 5);
                _ctx.moveTo(10, origin.y);
                _ctx.lineTo(width - 10, origin.y);
                
                _ctx.textAlign = "center";
                _ctx.font = "14px Arial";
                for(var i = 0; i < this.graphLabels.length; i++){
                    _ctx.fillText(this.graphLabels[i], origin.x + i * step.x, origin.y + 28);
                }
                _ctx.lineWidth = 1; 
                _ctx.strokeStyle = "#ffffff8a";
                _ctx.stroke();

                var xPos = 0;
                var yPos = 0;
                
                _ctx.beginPath(); 

                xPos = origin.x;
                yPos = origin.y - step.y * data[0]/100;
                this.graphPoints.push({x:xPos, y:yPos});
                _ctx.moveTo(xPos, yPos);
                
                for(var i = 1; i < data.length; i++){
                    xPos = origin.x + i * step.x;
                    yPos = origin.y - step.y * data[i]/100;
                    this.graphPoints.push({x:xPos, y:yPos});
                    _ctx.lineTo(origin.x + i * step.x, origin.y - step.y * data[i]/100);
                }
                _ctx.lineWidth = 4;
                _ctx.strokeStyle = "white";
                _ctx.stroke();
            }
        }
    }
</script>
<style>
    .marker{
        position: absolute;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background-color: white;
        cursor: pointer;
    }
    .road-map .marker-name{
        background-color: orange;
        line-height: 17px;
        padding: 0px 4px;
        border-radius: 4px;
        width: 50px;
    }
    .road-map,
    .chart-map{
        position: relative;
        height: 664px;
        color: white;
        overflow: hidden;
    }
    .road-map .back,
    .chart-map .back{
        height: 100%;
    }
    .chart-map .chart-header{
        padding: 20px 10px;
        position: absolute;
        top: 0px;
        font-size: 20px;
        width: 100%;
        border-bottom: 1px solid white;
    }
    .chart-map #chart-canvas{
        position: absolute;
        top:0px;
        left: 0px;
    }
    
</style>