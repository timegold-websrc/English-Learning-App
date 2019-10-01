<template>
  <div class="playboard-wrapper" style="width: 100%">
    <div v-if="isAnalysing" class="spinner loader-demo d-flex align-items-center justify-content-center">
        <div class="ball-spin-fade-loader">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
    <div class="text-pan d-flex">
        <img v-if="hasLike" :src="like? 'img/icons/love_active.png' : 'img/icons/love.png'" class="icon-standard pos-right" @click="changeLike">
        <div class="align-middle arrow" @click="moveLeft"><em class="fa-2x mr-2 fas fa-chevron-left"></em></div>

        <div class="align-middle fn-36 pl-2 pr-2 text-center">
            <p v-if="sentenceData">{{sentenceData.text}}</p>
        </div>
        
        <div class="align-middle arrow" @click="moveRight"><em class="fa-2x mr-2 fas fa-chevron-right"></em></div>

        <div v-if="result" class="pos-bottom d-flex">
            <div class="align-middle d-flex">
                <div class="border-circle-80 border-orange-2 fn-24 mr-5 text-center" @click="viewAnalyticResult">分析</div>
                <div v-if="result.marks >= 80" class="border-circle-80 border-success-2 fn-24 ml-5 text-center">{{result.marks}}分</div>
                <div v-else-if="result.marks >= 60" class="border-circle-80 border-warning-2 fn-24 ml-5 text-center">{{result.marks}}分</div>
                <div v-else class="border-circle-80 border-danger-2 fn-24 ml-5 text-center">{{result.marks}}分</div>
            </div>
        </div>
    </div>
    <div class="mt-4 text-center d-flex flex-center">
        <div class="align-bottom mr-5 standard-btn" @click="playStandard">
            <img :src="'img/icons/' + standBtnIcon" alt="record" class="icon-46">
            <p class="mb-0 mt-1 fn-12">标准音</p>    
        </div>
        <div class="record-btn" @mousedown="playRecord" @mouseup="stopRecord">
            <img :src="'img/icons/' + recordBtnIcon" alt="record" class="icon-78 cursor-pointer">
            <p  class="mb-0 mt-1 fn-12">{{recordBtnTxt}}</p>    
        </div>
        <div class="align-bottom ml-5 self-btn" @click="playSelf">
            <img :src="'img/icons/' + selfBtnIcon" alt="record" class="icon-46">
            <p  class="mb-0 mt-1 fn-12">自读音</p>    
        </div>
    </div>
    
  </div>
</template>

<script>
const _STOP_STATUS = 'start';
const _PLAY_STATUS = 'stop';
const _RETRY_STATUS = 'retry';

import axios from 'axios'
import Recorder    from '@/components/recordLib/recorder'
import {analysisResult}    from '@/components/analysisUtils'
export default {
    name: 'play_board',
    components: {
        Recorder
    },
    props: {
        hasLike: {
            type: Boolean,
            default: true
        },
        sentenceData: {
            type: Object,
            default: null
        },
        size: {
            type: Number,
            default: 50
        },
    },
    data () {
        return {
            player: null,
            recorder: null,
            result: null,
            like: false,
            recordStatus: _STOP_STATUS,
            standStatus: _STOP_STATUS,
            selfStatus: _STOP_STATUS,
            isAnalysing: false
        }
    },
    watch: {
        sentenceData: function(val){
            if(val) this.like = val.like;
            if(val && val.student_results.length && val.student_results[0].marks) {
                this.result = val.student_results[0];
                this.recordStatus = _RETRY_STATUS;
            }else{
                this.result = null;
                this.recordStatus = _STOP_STATUS;
            }
        }
    },
    computed: {
        recordBtnIcon: function(){
            if(this.recordStatus == _STOP_STATUS) return 'record_start.png';
            else if(this.recordStatus == _PLAY_STATUS) return 'record_stop.png';
            else return 'record_retry.png';
        },
        recordBtnTxt: function(){
            if(this.recordStatus == _STOP_STATUS) return '开始阅读';
            else if(this.recordStatus == _PLAY_STATUS) return '结束阅读';
            else return '重新阅读';
        },
        standBtnIcon: function(){
            if(this.standStatus == _STOP_STATUS) return 'play_stand.png';
            else return 'pause_stand.png';
        },
        selfBtnIcon: function(){
            if(this.selfStatus == _STOP_STATUS) return 'play_self.png';
            else return 'pause_self.png';
        }
        // ,
        // like: function(){
        //     if(this.sentenceData && this.sentenceData.like) return true;
        //     else return false;
        // }
    },
    mounted() {
        this.player = new Audio();
        this.recorder = new Recorder({
                beforeRecording : this.recorderCallback,
                afterRecording  : this.analysisRecord,
                pauseRecording  : this.recorderCallback,
                micFailed       : this.recorderCallback,
                bitRate         : 128,
                sampleRate      : 44100,
                format          : 'wav'
                })
    },
    methods: {
        moveLeft(){
            console.log('move left');
        },
        moveRight(){
            console.log('move right');
        },
        playRecord(){
            if(this.recordStatus == _STOP_STATUS) {
                this.recordStatus = _PLAY_STATUS;
                this.recorder.start();
            }else if(this.recordStatus == _RETRY_STATUS) {
                this.recordStatus = _STOP_STATUS;
                this.result = null;
            }
        },
        stopRecord(){
            if(this.recordStatus == _PLAY_STATUS) {
                this.recordStatus = _RETRY_STATUS;
                this.recorder.stop();
            }
        },
        playStandard(){
            if(!this.sentenceData || this.selfStatus == _PLAY_STATUS) return;
            if(this.standStatus == _PLAY_STATUS){
                this.player.pause();
                this.standStatus = _STOP_STATUS;
                return;
            }
            this.player.src = this.$serverURL +  this.sentenceData.audio_url;
            this.player.play();
            this.standStatus = _PLAY_STATUS;

            var _this = this;
            this.player.addEventListener("ended", function(){
                _this.standStatus = _STOP_STATUS;
            })
        },
        playSelf(){
            if(this.standStatus == _PLAY_STATUS || !this.sentenceData || !this.sentenceData.student_results.length) return;
            if(this.selfStatus == _PLAY_STATUS){
                this.player.pause();
                this.selfStatus = _STOP_STATUS;
                return;
            }

            var result_audio = this.sentenceData.student_results[0].audio_url;
            if(!result_audio) return;

            this.player.src = this.$serverURL + result_audio;
            this.player.play();
            this.selfStatus = _PLAY_STATUS;

            var _this = this;
            this.player.addEventListener("ended", function(){
                _this.selfStatus = _STOP_STATUS;
            })
        },

        analysisRecord(blob){
            this.isAnalysing = true;
            var data = new FormData();
            data.append('sentence_id', this.sentenceData.id);
            data.append('text', this.sentenceData.text);
            data.append('d_audio_url', this.sentenceData.audio_url);
            
            var file = new File([blob.blob], "_record.wav", {type: blob.blob.type});
            data.append('audio_file', file)

            var _this = this;
            var token = this.$store.getters.getToken;
            axios.post(this.$serverURL + '/audioCompareUtil/compare', data, {headers: {'Content-Type': 'multipart/form-data', 'authorization': `${token}`}})
                .then(function (response) {
                    _this.isAnalysing = false;
                    if(response.data.error) {
                        console.log(error);
                        return;
                    }

                    _this.setResult(response.data);
                }).catch(err=>{
                    _this.isAnalysing = false;
                })
        },
        recorderCallback(msg){
            console.log(msg);
        },
        setResult(resData){
            if(!resData.result) return;
            var data = analysisResult(resData.result);
            if(data.error) {
                console.log(data.error);
                return;
            }
            data['audio_url'] = resData.benchmark;
            this.$emit('changeResult', data);
        },
        viewAnalyticResult(){
            if(!this.sentenceData) return;
            this.$emit('viewAnalyticDetail', this.sentenceData.id);
        },
        changeLike(){
            this.like = !this.like;
            this.$emit('changeLike')
        }
    }
}
</script>
