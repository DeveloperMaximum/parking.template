'use strict';

/* пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch) */
var path = {
	dist: {
		css: 'assets/dist/css/',
        img: 'assets/dist/img/',
        tiles: 'assets/dist/tiles/',
		fonts: 'assets/dist/fonts/'
	},
	build: {
		html: 'assets/build/',
		css: 'assets/build/css/',
		img: 'assets/build/img/',
        tiles: 'assets/build/tiles/',
		fonts: 'assets/build/fonts/'
	},
	src: {
		html: 'assets/src/*.html',
		style: 'assets/src/style/main.scss',
		img: 'assets/src/img/*.*',
        tiles: 'assets/src/tiles/*.*',
		fonts: 'assets/src/fonts/**/*.*'
	},
	watch: {
		html: 'assets/src/**/*.html',
		css: 'assets/src/style/*.*',
		img: 'assets/src/img/**/*.*',
        tiles: 'assets/src/tiles/',
		fonts: 'assets/src/fonts/*.*'
	},
    cleanBuild: './assets/build/*',
    cleanDist: './assets/dist/*',
};

/* настройки сервера */
var config = {
	server: {
		baseDir: './assets/build'
	},
	notify: false
};

/* подключаем gulp и плагины */
var gulp = require('gulp'),  // подключаем Gulp
	webserver = require('browser-sync'), // сервер для работы и автоматического обновления страниц
	plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
	rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
	sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
	sass = require('gulp-sass')(require('sass')), // модуль для компиляции SASS (SCSS) в CSS
	autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
	cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
	uglify = require('gulp-uglify'), // модуль для минимизации JavaScript
	cache = require('gulp-cache'), // модуль для кэширования
	del = require('del'), // плагин для удаления файлов и каталогов
	rename = require('gulp-rename');

/* задачи */

// запуск сервера
gulp.task('webserver', function () {
	webserver(config);
});

// сбор html
gulp.task('html:build', function () {
	return gulp.src(path.src.html) // выбор всех html файлов по указанному пути
	.pipe(plumber()) // отслеживание ошибок
	.pipe(rigger()) // импорт вложений
	.pipe(gulp.dest(path.build.html)) // выкладывание готовых файлов
	.pipe(webserver.reload({ stream: true })); // перезагрузка сервера
});

// сбор стилей
gulp.task('css:build', function () {
	return gulp.src(path.src.style) // получим main.scss
		.pipe(sass())// scss -> css
		.pipe(plumber()) // для отслеживания ошибок
		.pipe(sourcemaps.init()) // инициализируем sourcemap
		.pipe(autoprefixer()) // добавим префиксы
		.pipe(gulp.dest(path.build.css))
		.pipe(rename({ suffix: '.min' }))
		.pipe(cleanCSS()) // минимизируем CSS
		.pipe(sourcemaps.write('./')) // записываем sourcemap
		.pipe(gulp.dest(path.build.css)) // выгружаем в build
		.pipe(gulp.dest(path.dist.css)) // выгружаем в dist
		.pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// перенос шрифтов
gulp.task('fonts:build', function () {
	return gulp.src(path.src.fonts)
	.pipe(gulp.dest(path.build.fonts))
	.pipe(gulp.dest(path.dist.fonts));
});

// обработка картинок
gulp.task('image:build', function () {
	return gulp.src(path.src.img) // путь с исходниками картинок
	.pipe(gulp.dest(path.build.img))
    .pipe(gulp.dest(path.dist.img));
});

// обработка тайлов
gulp.task('tiles:build', function () {
	return gulp.src(path.src.tiles) // путь с исходниками картинок
	.pipe(gulp.dest(path.build.tiles))
    .pipe(gulp.dest(path.dist.tiles));
});

gulp.task('clean:dist', function () {
	return del(path.cleanDist);
});

gulp.task('clean:build', function () {
    return del(path.cleanBuild);
});

// очистка кэша
gulp.task('cache:clear', function () {
	cache.clearAll();
});

// сборка
gulp.task('build',
	gulp.series('clean:build',
		gulp.parallel(
			'clean:dist',
			'html:build',
			'css:build',
			'fonts:build',
			'tiles:build',
			'image:build'
		)
	)
);

// запуск задач при изменении файлов
gulp.task('watch', function () {
	gulp.watch(path.watch.html, gulp.series('html:build'));
	gulp.watch(path.watch.css, gulp.series('css:build'));
	gulp.watch(path.watch.img, gulp.series('image:build'));
	gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
	gulp.watch(path.watch.tiles, gulp.series('tiles:build'));
});

// задача по умолчанию
gulp.task('default', gulp.series(
	'build',
	gulp.parallel('webserver','watch')
));
