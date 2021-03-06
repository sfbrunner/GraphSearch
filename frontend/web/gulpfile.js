var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var browserify = require('browserify')
var babelify = require('babelify')
var buffer = require('vinyl-buffer')
var source = require('vinyl-source-stream')
var gutil = require('gulp-util')
var del = require('del')
var notify = require('gulp-notify')
var plumber = require('gulp-plumber')
var duration = require('gulp-duration')
var argv = require('yargs').argv
var gulpif = require('gulp-if')
var uglify = require('gulp-uglify')
var envify = require('envify/custom')
var sass = require('gulp-sass')
 
function handleErrors(error) {
    notify.onError({
        title:   'Build Error',
        message: '<%= error.message %>'
    })(error)
    this.emit('end')
}
 
function build() {
    del(['./static/scripts/js/main.*'])
    browserify({
        entries: './static/scripts/jsx/main.js',
        debug: !argv.prod,
    })
    .transform(babelify)
    .transform(envify({'NODE_ENV': argv.prod ? 'production' : 'development'}), {global: true})
    .bundle()
    .on('error', handleErrors)
    .pipe(source('main.js'))
    .pipe(duration('main time'))
    .pipe(buffer())
    .pipe(gulpif(argv.prod, uglify()))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./static/scripts/js'))
    .pipe(notify({
        title:   'Build Success',
        message: 'Built at <%= new Date() %>!',
        onLast:   true
    }))
    del(['./static/scripts/js/components.*'])
    browserify({
        entries: './static/scripts/jsx/components.js',
        debug: !argv.prod,
    })
    .transform(babelify)
    .transform(envify({'NODE_ENV': argv.prod ? 'production' : 'development'}), {global: true})
    .bundle()
    .on('error', handleErrors)
    .pipe(source('components.js'))
    .pipe(duration('components time'))
    .pipe(buffer())
    .pipe(gulpif(argv.prod, uglify()))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./static/scripts/js'))
    .pipe(notify({
        title:   'Build Success',
        message: 'Built at <%= new Date() %>!',
        onLast:   true
    }))
    del(['./static/scripts/js/cytoComponents.*'])
    browserify({
        entries: './static/scripts/jsx/cytoComponents.js',
        debug: !argv.prod,
    })
    .transform(babelify)
    .transform(envify({'NODE_ENV': argv.prod ? 'production' : 'development'}), {global: true})
    .bundle()
    .on('error', handleErrors)
    .pipe(source('cytoComponents.js'))
    .pipe(duration('components time'))
    .pipe(buffer())
    .pipe(gulpif(argv.prod, uglify()))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./static/scripts/js'))
    .pipe(notify({
        title:   'Build Success',
        message: 'Built at <%= new Date() %>!',
        onLast:   true
    }))
    del(['./static/scripts/js/routehandler.*'])
    browserify({
        entries: './static/scripts/jsx/routehandler.js',
        debug: !argv.prod,
    })
    .transform(babelify)
    .transform(envify({'NODE_ENV': argv.prod ? 'production' : 'development'}), {global: true})
    .bundle()
    .on('error', handleErrors)
    .pipe(source('routehandler.js'))
    .pipe(duration('main time'))
    .pipe(buffer())
    .pipe(gulpif(argv.prod, uglify()))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./static/scripts/js'))
    .pipe(notify({
        title:   'Build Success',
        message: 'Built at <%= new Date() %>!',
        onLast:   true
    }))
}

function watch_sass() {
	return gulp.src('./static/scss/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('./static/css'))
}

function watch() {
    gulp.watch('./static/scripts/jsx/*.js', ['build'])
}
 
gulp.task('build', build)
gulp.task('watch', function() {
	gulp.watch('./static/scss/*.scss', ['sass'])
    build()
    watch()
})
gulp.task('default', ['watch'])
gulp.task('sass', watch_sass);
