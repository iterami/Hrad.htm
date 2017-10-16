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
