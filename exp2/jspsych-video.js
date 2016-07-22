/**
 * jspsych-video
 * Josh de Leeuw
 *
 * plugin for playing a video
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["video"] = (function() {

  var plugin = {};

  //jsPsych.pluginAPI.registerPreload('single-stim', 'stimulus', 'image');

  plugin.trial = function(display_element, trial) {

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // set default values for the parameters
    trial.prompt = trial.prompt || "";

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    // display stimulus
    var video_html = '';
    if(trial.center_vertical){
      video_html += '<div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; display: flex; align-items: center; justify-content: center">'
    }
    video_html += '<video id="jspsych-video-player" style="display:block; margin:auto;" width="'+trial.width+'" height="'+trial.height+'" '
    if(trial.autoplay){
      video_html += "autoplay "
    }
    if(trial.controls){
      video_html +="controls "
    }
    video_html+=">"
    for(var i=0; i<trial.sources.length; i++){
      var s = trial.sources[i];
      var type = s.substr(s.lastIndexOf('.') + 1);
      type = type.toLowerCase();
      video_html+='<source src="'+s+'" type="video/'+type+'">';
    }
    video_html +="</video>"
    if(trial.center_vertical){
      video_html += '</div>'
    }

    display_element.append(video_html);

    document.getElementById('jspsych-video-player').onended = function(){
      end_trial();
    }

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // function to end trial when it is time
    var end_trial = function() {

      // gather the data to store for the trial
      var trial_data = {
        stimulus: JSON.stringify(trial.sources)
      };

      //jsPsych.data.write(trial_data);

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

  };

  return plugin;
})();
