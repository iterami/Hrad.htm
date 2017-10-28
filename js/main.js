'use strict';

function repo_init(){
    core_repo_init({
      'beforeunload': {
        'todo': function(){
            // Warn players if they have already made progress.
            if(block_unload
              && resources['people']['amount'] > 0){
                return 'Save feature will be implemented in the future.';
            }
        },
      },
      'globals': {
        'block_unload': false,
        'daylight_passed': 0,
        'resource_defaults': {
          'food': {
            'amount': 10,
            'bonus': -1,
            'multiplier': 2,
            'workers': 0,
          },
          'gold': {
            'amount': 0,
            'bonus': 0,
            'workers': 0,
          },
          'people': {
            'amount': 1,
            'bonus': 0,
            'unemployed': 1,
            'workers': 0,
          },
          'stone': {
            'amount': 0,
            'bonus': 0,
            'workers': 0,
          },
        },
        'resources': {},
        'start_new_day': '<input onclick=day() type=button value="Start New Day [ENTER]">',
      },
      'keybinds': {
        13: {
          'todo': function(){
              if(daylight_passed === 0
                && resources['people']['amount'] > 0){
                  day();
              }
          },
        },
      },
      'storage': {
        'day-duration': 600,
      },
      'storage-menu': '<table><tr><td><input id=day-duration><td>ms</table>',
      'title': 'Hrad.htm',
    });

    core_storage_update();
    new_game();
}
