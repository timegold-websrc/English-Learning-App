export function analysisResult (sResult) {
    var strResult = sResult.replace(/\t/g, '').split('\n');
    console.log(strResult);
    var index_1 = strResult.indexOf("  DTW-based Align Result:");
    var index_2 = strResult.indexOf(" Wrong Accent and Tone Detection Result:");
    var index_3 = strResult.indexOf(" Mispronunciation Detection Result:");
    var index_4 = strResult.indexOf(" Correct words:");

    var timeLines = strResult.slice(index_1 + 3, index_2 - 1);
    var accent_tones = strResult.slice(index_2 + 2, index_3 - 1);
    var pronouns = strResult.slice(index_3 + 2, index_4 - 2);

    var results = [];
    var t_count = 0;
    var c_count = 0;
    try{
        for(var i = 0; i < timeLines.length; i++){
            var result = {id: i};
            t_count += 3;
            var r_1 = timeLines[i];
            r_1 = '{"' + r_1.replace(':', '":[').replace(/--/g, '0').replace('-', ',') + ']}'; 
            r_1 = JSON.parse(r_1);
            var txt = Object.keys(r_1)[0];
            result['text'] = txt.trim();
            result['r_s_seek'] = Math.round(r_1[txt][0][0] * 1000);
            result['r_e_seek'] = Math.round(r_1[txt][0][1] * 1000);
            result['d_s_seek'] = Math.round(r_1[txt][1][0] * 1000);
            result['d_e_seek'] = Math.round(r_1[txt][1][1] * 1000);
            
            
            var r_2 = accent_tones[i];
            r_2 = r_2.split(':')[1];
            r_2 = r_2.trim().split(/\s+/);
            
            if(r_2[0] == 'correct'){
                c_count += 1;
                result['accent'] = true;
            }else result['accent'] = false;

            if(r_2[1] == 'correct'){
                c_count += 1;
                result['tone'] = true;
            }else result['tone'] = false; 

            var r_3 = pronouns[i];
            r_3 = r_3.split(':')[1];
            r_3 = r_3.trim();
            if(r_3 == 'correct'){
                c_count += 1;
                result['prono'] = true;
            }else  result['prono'] = false;
            
            results.push(result);
        }
        
        results = JSON.stringify(results);
        return {marks: Math.round(100 * c_count/t_count), result: results}
    }catch(err){
        return {error: err};
    }
  }