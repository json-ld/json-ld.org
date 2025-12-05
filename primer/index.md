---
layout: fomantic
title: Primer
ga: 40462488
---

# Primers

The following primers are sorted in most recent to least recent order:
* [Latest](latest/)
{% for draft in specs['requirements'] -%}
* [{{ draft[0] }}]({{ draft[1] }})
{% endfor %}
