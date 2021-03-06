/*!
 * StartIt (v1.2.1): tools/tasks/serve.js
 * Copyright (c) 2017-21 Adorade (https://adorade.ro)
 * Licensed under MIT
 * ========================================================================== */

import {
  lintScss, lintJs, lintPug, compile, transpile, fonts, image, convert, statics, pug
} from './';
import {
  series, watch, args, taskTarget, $, bs,
  bgBlue, bgRed, magenta, paths, opts, watchEvent
} from '../util';

// Automatically reload assets or refresh your browser when changes occur
// -----------------------------------------------------------------------------
export function serve(done) {
  if (!args.production) {
    // Serve files from the 'tmp' directory of this project
    bs.init({
      server: {
        baseDir: taskTarget
      },
      logPrefix: 'StartIt',
      port: 1234,
      ui: false
    });

    // Note: tasks must be a function with `.displayName`
    const watchers = [
      {
        name: 'Styles',
        paths: [ paths.styles.all ],
        tasks: [ lintScss, compile ]
      },
      {
        name: 'Scripts',
        paths: [ paths.scripts.src ],
        tasks: [ lintJs, transpile ]
      },
      {
        name: 'Fonts',
        paths: [ paths.fonts.src ],
        tasks: [ fonts ]
      },
      {
        name: 'Images',
        paths: [
          paths.images.src.image,
          paths.images.src.webp
        ],
        tasks: [ image, convert ]
      },
      {
        name: 'Statics',
        paths: [ paths.statics.src ],
        tasks: [ statics ]
      },
      {
        name: 'Templates',
        paths: [
          paths.views.all,
          paths.views.data.all,             // Data files
          paths.docs.src,                   // Docs files
          taskTarget + '/css/inline.css'    // inline.css
        ],
        tasks: [ lintPug, pug ]
      }
    ];

    for (let watcher of watchers) {
      $.log(bgRed(`Watching ${watcher.name}`));

      for (let p of [ watcher.paths ]) {
        $.log(`${bgBlue('Source:')} ${magenta(p)}`);
      }

      let taskNames = [];

      for (let value of Object.values(watcher.tasks)) {
        let taskName = value.displayName;
        taskNames.push(taskName);
      }

      watch(
        watcher.paths, opts.watch, series(watcher.tasks)
      )
        // https://github.com/paulmillr/chokidar#getting-started
        .on('all', (event, path) => {
          // event = event[event.length - 1] === 'e' ? event + 'd' : event + 'ed';
          watchEvent(path, event, taskNames);
        });
    }
  }
  done();
}
serve.displayName = 'serve:watch';
serve.description = 'Serve and Watch';
