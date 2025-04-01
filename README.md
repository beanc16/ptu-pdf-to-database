# ptu-pdf-to-database

A data migration tool for reading data for [the Pokemon Tabletop United (PTU) TTRPG system](https://pokemontabletop.com/about) from PDF to JSON to MongoDB.

## Why was this tool made?
I have [a Discord Bot](https://github.com/beanc16/roll-of-darkness-bot) that allows users to look up data for PTU, but it was missing data from Pokemon's 9th Generation. This tool parses the data from the Unofficial Gen 9 Homebrew document into the JSON structure that the bot expects, then insert it into the database that the bot uses.
