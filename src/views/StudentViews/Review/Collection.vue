<template>
    <ContentWrapper>
        <p class="text-muted ml-2">当前位置: 收藏本 </p>
        <div class="card ml-2 mr-2 p-2">
            <div class="d-flex">
                <button type="button" class="btn btn-oval btn-primary fn-14 pt-1 pb-1 mr-4" >收藏本</button>
                <router-link to="/collection/review" title="Review">
                    <button type="button" class="btn btn-oval btn-outline-secondary fn-14 pt-1 pb-1 text-muted">错词本</button>
                </router-link>
            </div>
        </div>
        <div class="row ml-2 mr-2">
            <div class="col-4 pr-3 pl-0">
                <div v-if="collectionData" class="card pt-3 pb-3">
                    <div class="d-flex pl-4 pr-4 mb-2 pb-2 border-bottom">
                        <div class="flex-row mr-auto action-btn" @click="selectAll">
                            <div v-if="isEditable" class="mt-2 fn-14">
                                <em v-if="isCheckAll" class="far fa-check-circle fn-info" ></em>
                                <em v-else class="far fa-circle"></em>
                                全选
                            </div>
                            <div v-else class="fn-18">我的收藏</div>
                        </div>
                        <div class="flex-row mt-2 fn-14">
                            <span v-if="isEditable" class="action-btn fn-danger" @click="deleteCollections">删除</span>
                            <span v-if="isEditable" class="action-btn fn-info ml-2" @click="setOnTop">置顶</span>
                            <span v-if="isEditable" class="action-btn ml-2" @click="showActions">取消</span>
                            <span v-else class="action-btn ml-2" @click="showActions">编辑</span>
                        </div>
                    </div>
                    <div style="max-height: 618px; overflow: auto">
                        <div v-for="(item, index) in collectionData" 
                            :key="index"
                            :class="sentenceIndex == index ? 'active' : ''"
                            @click="selectSentence(index)"
                            class="d-flex align-items-center p-2 sentence">
                            <div class="fn-14 mr-auto">
                                <span v-if="isEditable" class="mr-2">
                                    <em v-if="checkList.includes(index)" class="far fa-check-circle fn-info"></em>
                                    <em v-else class="far fa-circle"></em>
                                </span>
                                <span class="" >{{item.text}}</span> 
                            </div>
                            <div class="fn-14 flex-shrink-0" style="min-width: 62px">
                                <span class="mr-2"><img src="img/icons/record.png" alt="record" class="icon-small"> </span>
                                
                                <span v-if="!item.marks"  class="fn-danger ">未读</span>
                                <span v-else-if="item.marks >= 80" class="fn-success ">{{item.marks}}分</span>
                                <span v-else-if="item.marks >= 60" class="fn-warning ">{{item.marks}}分</span>
                                <span v-else  class="fn-danger ">{{item.marks}}分</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card col-8 p-4" style="height: fit-content">
                <play-board 
                    :sentenceData="collectionData[sentenceIndex]" 
                    :hasLike = "false"
                    @changeResult="updateSentenceResult"
                    @viewAnalyticDetail="gotoDetail"/>
            </div>
        </div>
    </ContentWrapper>
</template>
<script>
    const _COLLECTION_ = 3;
    import PlayBoard from '@/components/Common/PlayBoard';
    import axios from 'axios';
    export default {
        components: {
            PlayBoard
        },
        data () {
            return {
                isCheckAll: false,
                checkList: [],
                isEditable: false,
                sentenceIndex: 0,
                collectionData: []
            }
        },
        mounted() {
            this.initCollection();
        },
        methods: {
            initCollection: function(){
                var _this = this;
                var token = this.$store.getters.getToken;
                axios.get(this.$serverURL + '/api/collections', {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        var sentences = response.data;
                        // console.log(sentences);

                        for(var index in sentences){
                            var sentence = sentences[index];

                            if(sentence.collection_result) {
                                sentence['student_results'] = [sentence.collection_result];
                                sentence['like'] = sentence.collection_result.heart;
                                sentence['marks'] = sentence.collection_result.marks;
                            }else {
                                sentence['student_results'] = [];
                                sentence['like'] = false;
                                sentence['marks'] = 0;
                            }
                        }

                        _this.collectionData = sentences;
                    })
            },
            showActions(){
                this.isEditable = !this.isEditable;
                this.isCheckAll = false;
                this.checkList = [];
            },
            selectSentence(index){
                if(this.isEditable){
                    var id = this.checkList.indexOf(index);

                    if(this.isCheckAll){
                        this.isCheckAll = false;
                        this.checkList.splice(id, 1);
                    }else if(id + 1) this.checkList.splice(id, 1);
                    else this.checkList.push(index);
                }else{
                    this.sentenceIndex = index;
                    this.checkList = [];
                }
            },
            selectAll(){
                this.isCheckAll = !this.isCheckAll;
                this.checkList = [];

                if(this.isCheckAll) {
                    for(var i = 0; i < this.collectionData.length; i++){
                        this.checkList.push(i);
                    } 
                }
            },
            deleteCollections(){
                if(!this.checkList.length) return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.post(this.$serverURL + '/api/collections/delete_collections', {collection_ids: this.getCollectionIds()}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        // console.log(response.data);
                        _this.checkList = [];
                        _this.isCheckAll = false;
                        _this.initCollection();
                    })
            },
            setOnTop(){
                if(!this.checkList.length) return;

                var _this = this;
                var token = this.$store.getters.getToken;
                axios.put(this.$serverURL + '/api/collections/setCollectionsOnTop', {collection_ids: this.getCollectionIds()}, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }

                        _this.checkList = [];
                        _this.initCollection();
                    })
                
            },
            getCollectionIds(){
                let collectIds = [];
                for(var i = 0; i < this.checkList.length; i++){
                    var _index = this.checkList[i];
                    collectIds.push(this.collectionData[_index].id)
                }
                return collectIds;
            },
            updateSentenceResult(data){
                console.log(data);
                var _this = this;
                var token = this.$store.getters.getToken;
                var sentence_id = this.collectionData[this.sentenceIndex].id;
                axios.put(this.$serverURL + '/api/collections/updateCollectionResult/' + sentence_id, data, {headers: {'authorization': `${token}`}})
                    .then(function (response) {
                        if(response.data.error){
                            if(response.data.error == 'tokenError') _this.$router.push('/login');
                            else return;
                        }
                        
                        _this.initCollection();
                    })
            },
            gotoDetail(sen_id){
                this.$router.push({path: '/analytic_result', query: {path: ['收藏本'] , type: _COLLECTION_, id: sen_id}});
            }
        }
    }
</script>
