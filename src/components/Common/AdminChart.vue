<template>
    <div ref="chartWrapper" class="admin-chart-wrapper"></div>
</template>

<script>
export default {
    name: 'admin-chart',
    props: {
        unit: String,
        labels: Array,
        datas: Array
    },
    data () {
        return {
            colors: ['#5C99E1', '#D2910E', '#FF0404']
        }
    },
    watch: {
        datas: function(val){
            this.drawGraph();
        },
        // labels: function(val){
        //     this.drawGraph();
        // }
    },
    mounted() {
        var wrapper = this.$refs.chartWrapper;
        var myCanv = document.createElement('canvas');
        myCanv.id = 'chart-canvas';
        myCanv.height = wrapper.clientHeight;
        myCanv.width = wrapper.clientWidth;

        wrapper.appendChild(myCanv);
    },
    methods: {
        drawGraph(){
            var _canvas = document.getElementById("chart-canvas");
            var _ctx = _canvas.getContext("2d");

            var _w_ = _canvas.width;
            var _h_ = _canvas.height - 20;
            var _xMargin = 36;
            var _xStep = (_w_ - 2 * _xMargin) / (this.labels.length - 1);
            var _minV = 100, _maxV = 0;

            _ctx.clearRect(0, 0, _w_, _h_ + 20);

            for(var i= 0; i < this.datas.length; i++){
                var dataArray = this.datas[i];
                _ctx.lineWidth = 2; 
                _ctx.strokeStyle = this.colors[i];
                _ctx.fillStyle = this.colors[i];

                _ctx.beginPath(); 
                _ctx.moveTo(_xMargin, this.getYPos(dataArray[0], _h_) );
                _ctx.arc(_xMargin, this.getYPos(dataArray[0], _h_), 3, 0, 2 * Math.PI);
                _ctx.fill();

                if(dataArray[0] > _maxV) _maxV = dataArray[0];
                if(dataArray[0] < _minV) _minV = dataArray[0];

                for(var j = 1; j < dataArray.length; j++){
                    if(dataArray[j] > _maxV) _maxV = dataArray[j];
                    if(dataArray[j] < _minV) _minV = dataArray[j];
                    
                    _ctx.beginPath();
                    _ctx.moveTo(_xMargin + (j-1) * _xStep, this.getYPos(dataArray[j - 1], _h_));
                    _ctx.lineTo(_xMargin + j * _xStep, this.getYPos(dataArray[j], _h_));
                    _ctx.stroke();

                    _ctx.beginPath();
                    _ctx.arc(_xMargin + j * _xStep, this.getYPos(dataArray[j], _h_), 3, 0, 2 * Math.PI);
                    _ctx.fill();
                }
            }

            _ctx.strokeStyle = '#9B9B9B52';
            _ctx.fillStyle = '#9B9B9B';
            _ctx.beginPath(); 
            _ctx.moveTo(0, _h_);
            _ctx.lineTo(_w_, _h_);
            _ctx.stroke()

            _ctx.textAlign = "center";
            _ctx.font = "14px Microsoft YaHei";
            
            for(var i = 0; i < this.labels.length; i++){
                _ctx.fillText(this.labels[i], _xMargin + i * _xStep, _h_ + 20);
            }  

            _ctx.strokeStyle = '#9B9B9B40';
            _ctx.fillStyle = '#9E9E9Ea5';
            _ctx.textAlign = "left";
            _ctx.font = "11px Microsoft YaHei";
            ////////////// limit //////////////
            _ctx.beginPath(); 
            _ctx.moveTo(10, this.getYPos(_maxV, _h_));
            _ctx.lineTo(_w_ - 30, this.getYPos(_maxV, _h_));
            _ctx.fillText(_maxV + this.unit, _w_ - 30, this.getYPos(_maxV, _h_) + 4);
            _ctx.stroke()

            _ctx.beginPath(); 
            _ctx.moveTo(10, this.getYPos(_minV, _h_));
            _ctx.lineTo(_w_ - 30, this.getYPos(_minV, _h_));
            _ctx.fillText(_minV + this.unit, _w_ - 30, this.getYPos(_minV, _h_) + 4);
            _ctx.stroke()
            ///////////////////////////////////
        },
        getYPos(y, H){
            var _yMargin = 10;
            return (H - 2 * _yMargin) * (1 - y / 100) + _yMargin;
        }
    },
}
</script>
