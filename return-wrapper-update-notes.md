copy paste the following after `tmp` in `returnWrapper()`

```js
	//points
	{},
	// ridges
	[],
	// outlines
	[],
	// faces
	[]
```

```js
Array.from(
	new Set(
		``
			.replace(/\[|\]/g, '')
			.split(/\n/g)
			.join(',')
			.replace(/\t|\s/g, '')
			.replace(/,+/g, ',')
			.split(',')
	)
)
```

Go to https://regexr.com/

// tmp faces points = replace \[|\]
// tmp faces to faces = replace (\w+) with '$1'
