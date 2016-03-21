/**
 * jspsych-flashcard
 * Josh de Leeuw
 *
 * documentation: NA
 *
 **/

jsPsych.plugins["flashcard"] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {

    // default trial parameters
    trial.minimum_flips = (typeof trial.minimum_flips === 'undefined') ? 0 : trial.minimum_flips;
    trial.minimum_duration = trial.minimum_duration || -1;
    trial.maximum_duration = trial.maximum_duration || -1;
    trial.maximum_flips = trial.maximum_flips || - 1;
    trial.prompt = (typeof trial.prompt === 'undefined') ? "" : trial.prompt;

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // this array holds handlers from setTimeout calls
    // that need to be cleared if the trial ends early
    var setTimeoutHandlers = [];

    var front = true;

    // display stimulus
    var html = '<div class="stage" style="perspective:1000px;-webkit-perspective:1000px;">';
    html += '<div class="flashcard" style="height:300px; width:500px; margin:10% auto; border: 1px solid gray; box-shadow: 0px 0px 9px #888; transform-style: preserve-3d; transition: all 1s; cursor: pointer;">';
    html += '<div class="front" style="transform:rotateX(0deg); height: 300px; width: 500px; position: absolute; text-align: center; backface-visibility: hidden;  -webkit-backface-visibility:hidden;"><p style="margin-top: 25%; font-size: 3em;">' + trial.front + '</p></div>';
    html += '<div class="back" style="transform:rotateX(180deg); height: 300px; width: 500px; position: absolute; text-align: center; backface-visibility: hidden; -webkit-backface-visibility:hidden;"><p style="margin-top: 25%; font-size: 3em;">' + trial.back + '</p></div>';
    html += '</div></div>';
    display_element.append(html);

    $('.flashcard').on('click', function(){
      update_time(true);
      if(front){
        $('.flashcard').css({transform: "rotateX(180deg)"});
      } else {
        $('.flashcard').css({transform: "rotateX(0deg)"});
      }
      front = !front;
      if(flips.length >= trial.minimum_flips){
        enable_continue_button();
      }
      if(flips.length >= trial.maximum_flips){
        $('.flashcard').off('click').css('cursor','not-allowed');
      }
    });

    function update_time(flip){
      var now = Date.now();
      var time = now - start_time;
      if(flips.length > 0){
        var time_on_current = time - flips[flips.length-1].time;
      } else {
        var time_on_current = now - start_time;
      }
      if(flip) {
        flips.push({time: time});
      }
      if(front){
        total_time_front += time_on_current;
      } else {
        total_time_back += time_on_current;
      }
    }

    //display continue button
    function enable_continue_button(){
      $('#jspsych-flashcard-continue').prop("disabled", false);
    }

    display_element.append('<div class="block-center center-content"><button id="jspsych-flashcard-continue" class="jspsych-btn">Continue</button></div>')
    $('#jspsych-flashcard-continue').prop('disabled',true).on('click', function(e) {
      end_trial();
    });

    //show prompt if there is one
    if (trial.prompt !== "") {
      display_element.append(trial.prompt);
    }

    // store flips
    var flips = [];
    var total_time_front = 0;
    var total_time_back = 0;

    // start time
    var start_time = Date.now();

    // function to end trial when it is time
    function end_trial() {

      update_time(false);

      // kill any remaining setTimeout handlers
      for (var i = 0; i < setTimeoutHandlers.length; i++) {
        clearTimeout(setTimeoutHandlers[i]);
      }

      // gather the data to store for the trial
      var trial_data = {
        "flips": JSON.stringify(flips),
        "n_flips": flips.length,
        "total_time_front": total_time_front,
        "total_time_back": total_time_back,
        "front": trial.front,
        "back": trial.back
      };

      // clear the display
      display_element.html('');

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };


    // hide image if timing is set
    if (trial.minimum_duration > 0) {
      var t1 = setTimeout(function() {
        if(flips.length >= trial.minimum_flips){
          enable_continue_button();
        }
      }, trial.minimum_duration);
      setTimeoutHandlers.push(t1);
    } else {
      if(trial.minimum_flips < 1) {
        enable_continue_button();
      }
    }

    // end trial if time limit is set
    if (trial.maximum_duration > 0) {
      var t2 = setTimeout(function() {
        end_trial();
      }, trial.maximum_duration);
      setTimeoutHandlers.push(t2);
    }

  };

  return plugin;
})();
