all:
	./node_modules/.bin/coffeelint \
		src/main.coffee

	./node_modules/.bin/coffee \
		-c \
		-o ./ \
		src/main.coffee

	./node_modules/.bin/jade \
		--out . \
		views/index.jade

	./node_modules/.bin/uglifyjs \
		-o main.min.js \
		main.js

lint:
	./node_modules/.bin/coffeelint \
		src/main.coffee

coffee:
	./node_modules/.bin/coffee \
		-c \
		-o ./ \
		src/main.coffee

jade:
	./node_modules/.bin/jade \
		--out . \
		views/index.jade

min:
	./node_modules/.bin/uglifyjs \
		-o main.min.js \
		main.js

.PHONY: lint
.PHONY: coffee
.PHONY: jade
.PHONY: min
