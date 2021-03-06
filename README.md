SwissGuesser
============

Swissguesser multi-projects

### 1/ Install and deploy

If you do not update the data, you may simply clone the project from the repository, copy the images file (see _subproject specifi_ below),
run the `template`part from buildout and deploy it:

    cd /var/www/vhosts/mf-swissguesser/private

    git clone git@github.com:geoadmin/mf-swissguesser.git swissguesser

    cd swissguesser

    python bootstrap.py --version 1.5.2 --distribute --download-base http://pypi.camptocamp.net/distribute-0.6.22_fix-issue-227/ --setup-source http://pypi.camptocamp.net/distribute-0.6.22_fix-issue-227/distribute_setup.py

    buildout/bin/buildout install template

    sudo apache2ctl graceful

    sudo -u deploy deploy -r deploy/deploy.cfg int   # or prod

### 2/ Updating data

To update a project, you need to install the buildout environment, update the `MetadatenAufnahme.csv` and `translation.csv`, and 
generate the new project file.

    cd /var/www/vhosts/mf-swissguesser/private

    git clone git@github.com:geoadmin/mf-swissguesser.git swissguesser

    python bootstrap.py --version 1.5.2 --distribute --download-base http://pypi.camptocamp.net/distribute-0.6.22_fix-issue-227/ --setup-source http://pypi.camptocamp.net/distribute-0.6.22_fix-issue-227/distribute_setup.py

    buildout/bin/buildout -c <project buildout>.cfg

    sudo apache2ctl graceful



### Subproject specific

Each subproject has two main .csv configurations files:

* `MetadatenAufnahme.csv`, the list of images to display
* `translation.csv`, obviously for internationalization of the user interface

These two files are used to generate the `base.json`for the former, and the files in the `locale`directory for the latter.
The buildout commands are, respectively with `buildout install convert-csv`and `buildout install translate-csv`.

In `MetadatenAufnahme.csv`, the four `Legend` columns may contain plain text, html entities or link to an external file. Using the `convert-csv`
buildout part, if you provide a `downloadUrl`on as an argument, the images will be linked instead of beeing downloaded.

### Storymap5 (BAR)

The original one! This GeoAdmin Story Map is an interactive game to guess historical locations from the Swiss National Archive on a Swisstopo map of Switzerland.

http://storymaps.geo.admin.ch/storymaps/storymap5

* The `MetadatenAufnahme` is derived from this `doc <https://docs.google.com/spreadsheet/ccc?key=0Alq30s3mf7gPdDZPbWlVaFA0SmVoaWFCZ3hTbGtyaWc&usp=drive_web#gid=0>`__
* Images have to be copied to the `images\photos` directory

### Storymap9 (KGS)

Protection of cultural property inventory

http://storymaps.geo.admin.ch/storymaps/storymap9

* Images are linked to the dav0 server
* Explanations text and the copyright information are scraped from map.geo.admin.ch htmlPopup and the `meta.txt` file using the `util\kgs_scraper.py` script
* The `MetadatenAufnahme.csv` has to be generated from the `MetadatenAufnahme.csv.template` using the
  `util\kgs_scraper.py` script


### Storymap10 (LUBIS)

Historic aerial view

http://storymaps.geo.admin.ch/storymaps/storymap10

* Images have to be copied to `static\storymap10\data\photos`
* Explanations are linked to _map.geo.admin.ch_ popup
* The `MetadatenAufnahme.csv` has to be generated from the `MetadatenAufnahme.csv.template` using the
  `util\lubis_scraper.py` script

