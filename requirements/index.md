---
layout: fomantic
ga: 40462488
---

# Requirements

The following requirements are sorted in most recent to least recent order:
* [Latest](latest/)
{% for draft in specs['requirements'] -%}
* [{{ draft[0] }}]({{ draft[1] }})
{% endfor %}
