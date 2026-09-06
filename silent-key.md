---
layout: default
title: Silent Key
permalink: /silent-key/
description: In memoriam — radioamateurs van sectie OSA (ON4OSA) die ons zijn ontvallen.
---

<section class="section">
  <div class="container">
    <div class="section-head text-center">
      <span class="section-kicker">In memoriam</span>
      <h1 class="section-title">Silent Key</h1>
      <p class="section-sub">
        "Silent Key" is de term waarmee radioamateurs een collega gedenken die
        is overleden. Op deze pagina houden we de herinnering levend aan de
        leden van sectie OSA die ons zijn ontvallen — hun roepnaam blijft
        verbonden met onze club.
      </p>
    </div>

    {%- comment -%}
      Entries come from _data/silent-key.yml. The hyphen in the filename means
      the bracket form is required — site.data.silent-key would be parsed as a
      subtraction. Images are used as-is, in their original format.
    {%- endcomment -%}
    {%- comment -%}
      Dated entries first, newest at the top. Entries without a `date` keep the
      order of the data file and are appended at the bottom, so a missing date
      never reshuffles the rest.
    {%- endcomment -%}
    {%- assign sk_all = site.data['silent-key'] -%}
    {%- assign sk_dated = sk_all | where_exp: "e", "e.date.size > 0" | sort: 'date' | reverse -%}
    {%- assign sk_undated = sk_all | where_exp: "e", "e.date.size == 0" -%}
    {%- assign silent_keys = sk_dated | concat: sk_undated -%}
    {%- if silent_keys and silent_keys.size > 0 -%}
    {%- for sk in silent_keys -%}
    {%- comment -%}
      Only render the photo column when the file actually exists, so an entry
      whose picture has not been added yet shows as text instead of a broken
      image.
    {%- endcomment -%}
    {%- assign sk_path = '/assets/img/silent-key/' | append: sk.image -%}
    {%- assign sk_file = site.static_files | where: 'path', sk_path | first -%}
    <article class="sk-entry row align-items-center g-4 g-lg-5">
      {%- if sk_file -%}
      <div class="col-12 col-md-4">
        <img class="sk-img" src="{{ sk_path | relative_url }}"
             alt="{{ sk.callsign }}"
             {% if sk.width and sk.height %}width="{{ sk.width }}" height="{{ sk.height }}"{% endif %}
             loading="lazy" decoding="async">
      </div>
      {%- endif -%}
      <div class="col-12 {% if sk_file %}col-md-8{% endif %}">
        <h2 class="sk-callsign">{{ sk.callsign }}</h2>
        {%- comment -%}
          Years are only shown when the year of death is known; an unknown year
          of birth then falls back to "?". No year of death, no brackets.
        {%- endcomment -%}
        {%- if sk.name or sk.year_of_death -%}
        <p class="sk-name">{{ sk.name }}{%- if sk.year_of_death %} <span class="sk-years">({{ sk.year_of_birth | default: "?" }}&ndash;{{ sk.year_of_death }})</span>{% endif -%}</p>
        {%- endif -%}
        {%- if sk.text -%}
        <div class="sk-text">{{ sk.text | markdownify }}</div>
        {%- endif -%}
      </div>
    </article>
    {%- endfor -%}
    {%- else -%}
    <p class="results-note">Er zijn momenteel geen vermeldingen op deze pagina.</p>
    {%- endif -%}
  </div>
</section>
