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

Fonts
-----

* The "{}" text uses Bitstream Vera Sans Mono with Normal style.
* The "JSON-LD" text uses Roboto with Bold style.
  https://www.google.com/fonts#UsePlace:use/Collection:Roboto:700

Editing
-------

If you use Inkscape to edit the SVGs, you may want to check if your
saved files have Inkscape cruft in them. You can clean things up with:

    $ inkscape --export-plain-svg=output.svg input.svg

ChangeLog
---------

* 2013:
  * Created.
* 2014-09-15:
  * Fixed "{" and "}" to use the same font (Bitstream Vera Sans Mono).
  * Changed "JSON-LD" to use Roboto font.
  * Made json-ld-logo square.
