JSON-LD Icons
=============

Files
-----

* index.html: images information
* json-ld-logo.{xcf,1,2,3}: website header images
* json-ld-logo.{svg,-#.png}: rectangular logo
* json-ld-button.{svg,-#.png}: web button
* json-ld-data.{svg,-#.png}: data image

Building
--------

To create the icons from SVG:

    $ make

To clean up old pngs:

    $ make clean

To create multi-size ../favicon.ico:

    $ make
    # open largest json-ld-data-64.png with GIMP
    # go to File > Open as Layers...
    # select the 32 and 16 files
    # export to favicon.ico
