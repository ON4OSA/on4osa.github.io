---
layout: default
title: Velddagen
permalink: /velddagen/
description: Overzicht van de deelnames van ON4OSA aan de UBA velddagen.
---

<section class="section">
  <div class="container">
    <div class="section-head text-center">
      <span class="section-kicker">Palmares</span>
      <h1 class="section-title">Deelnames aan UBA velddagen</h1>
      <p class="section-sub">
        Een overzicht van onze velddagdeelnames onder ON4OSA/P, met categorie
        en uitslag. Klik op een rij voor de officiële UBA-uitslag.
      </p>
    </div>

    <div class="table-responsive results-table">
      <table class="table align-middle">
        <thead>
          <tr>
            <th scope="col">Datum</th>
            <th scope="col">Evenement</th>
            <th scope="col">Roepnaam</th>
            <th scope="col">Categorie</th>
            <th scope="col" class="text-nowrap">Resultaat</th>
          </tr>
        </thead>
        <tbody>
          {%- assign events = site.data.velddagen | sort: "date" | reverse -%}
          {%- for e in events -%}
          <tr>
            <td class="text-nowrap" data-label="Datum">{{ e.date_label }}</td>
            <td data-label="Evenement">{{ e.event }}</td>
            <td class="text-nowrap" data-label="Roepnaam"><span class="callsign">{{ e.callsign }}</span></td>
            <td data-label="Categorie">{{ e.category }}</td>
            <td data-label="Resultaat">
              {%- if e.placement == "1e plaats" -%}
                <span class="badge-result badge-win">{{ e.placement }}</span>
              {%- else -%}
                <span class="badge-result">{{ e.placement }}</span>
              {%- endif -%}
              <span class="result-score">{{ e.score }}&nbsp;ptn</span>&#8203;
              {%- if e.qso -%}<span class="result-qso">{{ e.qso }}&nbsp;QSO</span>{%- endif -%}
              {%- if e.url -%}
              <a class="result-src" href="{{ e.url }}" target="_blank" rel="noopener" aria-label="Officiële uitslag">uitslag →</a>
              {%- endif -%}
            </td>
          </tr>
          {%- endfor -%}
        </tbody>
      </table>
    </div>

    <p class="results-note">
      Datums volgen de vaste UBA-kalender (CW: eerste weekend van juni · SSB:
      eerste weekend van september). Uitslagen zoals gepubliceerd door de UBA.
    </p>

    <div class="section-head text-center gallery-head">
      <span class="section-kicker">Sfeerbeelden</span>
      <h2 class="section-title">Enkele sfeerbeelden</h2>
    </div>

    {%- comment -%}
      One entry per photo in _data/velddagen_fotos.yml: `file`, `caption` and an
      optional `alt` that falls back to the caption.
    {%- endcomment -%}
    <div id="velddagCarousel" class="carousel slide carousel-fade osa-carousel"
         data-bs-ride="carousel" data-bs-interval="4000">
      <div class="carousel-indicators">
        {%- for foto in site.data.velddagen_fotos -%}
        <button type="button" data-bs-target="#velddagCarousel" data-bs-slide-to="{{ forloop.index0 }}"
                {% if forloop.first %}class="active" aria-current="true"{% endif %}
                aria-label="{{ foto.caption }}"></button>
        {%- endfor -%}
      </div>
      <div class="carousel-inner">
        {%- for foto in site.data.velddagen_fotos -%}
        <div class="carousel-item{% if forloop.first %} active{% endif %}">
          <img src="{{ '/assets/img/velddagen/' | append: foto.file | append: '.jpg' | relative_url }}"
               class="d-block" alt="{{ foto.alt | default: foto.caption }}" loading="lazy">
          <p class="carousel-caption-pill">{{ foto.caption }}</p>
        </div>
        {%- endfor -%}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#velddagCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Vorige</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#velddagCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Volgende</span>
      </button>
    </div>
  </div>
</section>
