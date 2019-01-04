/*!
 * StartIt (v1.0.0): style.js
 * Copyright (c) 2017 - 2019 Adorade (https://adorade.ro)
 * Licensed under MIT
 * ========================================================================= */
'use strict';

import { debugInfo } from './util/handler';

// Compiling Sass to CSS code
const style = ({
  gulp,
  plugins,
  args,
  config,
  taskTarget,
  browserSync
}) => {
  const paths = config.paths;
  const fileExt = config.fileExt;
  const opts = config.options;
  const cssPath = [];

  taskTarget = args.production ? paths.styles.prod : paths.styles.dev;

  if (args.production) {
    opts.entry.css.inline = true;
    opts.entry.css.external = false;
  }

  if (opts.entry.css.external) {
    cssPath.push(paths.styles.src + opts.entry.cssExternal);
  }
  if (opts.entry.css.inline) {
    cssPath.push(paths.styles.src + opts.entry.cssInline);
  }

  gulp.task('style', gulp.series('lint:style', () => {
    return gulp
      .src(cssPath, {
        sourcemaps: true
        // Only deal with files that change in the pipeline
        // since: gulp.lastRun('style')
      })
      .pipe(debugInfo({ title: 'Compile:' }))
      .pipe(plugins.sass(opts.sass)).on('error', plugins.sass.logError)
      .pipe(plugins.cached('sass_compile'))
      .pipe(plugins.autoprefixer(opts.autoprefixer))
      .pipe(plugins.if(args.production, plugins.csso(opts.csso)))
      .pipe(plugins.if(args.production, plugins.rename({ extname: '.min.css' })))
      .pipe(gulp.dest(taskTarget, { sourcemaps: './' }))
      .pipe(browserSync.stream({match: fileExt.css }));
  }));
};

export default style;
