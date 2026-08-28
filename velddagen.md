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
        en uitslag.
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
            <th scope="col" class="vd-icons-col"><span class="visually-hidden">Foto's</span></th>
          </tr>
        </thead>
        <tbody>
          {%- assign events = site.data.velddagen | sort: "date" | reverse -%}
          {%- for e in events -%}
          {%- comment -%}
            Photo gallery per velddag. No configuration: the prefix is derived
            from the entry itself ("UBA Velddag SSB" + 2025 -> velddag-ssb-2025-)
            and every matching file in /assets/img/velddagen/ is picked up, in
            whatever format it was added. See CLAUDE.md.
          {%- endcomment -%}
          {%- assign vd_mode = e.event | split: " " | last | downcase -%}
          {%- assign vd_year = e.date | date: "%Y" -%}
          {%- capture vd_prefix -%}/assets/img/velddagen/velddag-{{ vd_mode }}-{{ vd_year }}-{%- endcapture -%}
          {%- capture vd_id -%}galerij-{{ vd_mode }}-{{ vd_year }}{%- endcapture -%}
          {%- assign vd_fotos = site.static_files | where_exp: "f", "f.path contains vd_prefix" | sort: "name" -%}
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
              {%- comment -%}
                score/points/multiplier stay in _data/velddagen.yml for
                completeness but are deliberately not shown here.
              {%- endcomment -%}
              {%- if e.qso -%}<span class="result-qso">{{ e.qso }}&nbsp;QSOs</span>{%- endif -%}
              {%- if e.url -%}
              <a class="result-src" href="{{ e.url }}" target="_blank" rel="noopener" aria-label="Officiële uitslag">uitslag →</a>
              {%- endif -%}
            </td>
            <td class="vd-icons" data-label="Foto's">
              {%- if vd_fotos.size > 0 -%}
              <button type="button" class="vd-galerij-btn" data-bs-toggle="modal" data-bs-target="#{{ vd_id }}"
                      aria-label="Bekijk {{ vd_fotos.size }} foto's van {{ e.event }} {{ vd_year }}"
                      title="{{ vd_fotos.size }} foto's">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
                </svg>
              </button>
              {%- endif -%}
            </td>
          </tr>
          {%- endfor -%}
        </tbody>
      </table>
    </div>

    {%- comment -%}
      Gallery lightboxes, rendered after the table so no modal lives inside a
      table cell.
    {%- endcomment -%}
    {%- for e in events -%}
    {%- assign vd_mode = e.event | split: " " | last | downcase -%}
    {%- assign vd_year = e.date | date: "%Y" -%}
    {%- capture vd_prefix -%}/assets/img/velddagen/velddag-{{ vd_mode }}-{{ vd_year }}-{%- endcapture -%}
    {%- capture vd_id -%}galerij-{{ vd_mode }}-{{ vd_year }}{%- endcapture -%}
    {%- assign vd_fotos = site.static_files | where_exp: "f", "f.path contains vd_prefix" | sort: "name" -%}
    {%- if vd_fotos.size > 0 -%}
    <div class="modal fade galerij-modal" id="{{ vd_id }}" tabindex="-1"
         aria-labelledby="{{ vd_id }}-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">
          <h3 class="visually-hidden" id="{{ vd_id }}-label">Foto's van {{ e.event }} {{ vd_year }}</h3>
          <button type="button" class="btn-close btn-close-white galerij-close"
                  data-bs-dismiss="modal" aria-label="Sluiten"></button>
          <div id="{{ vd_id }}-carousel" class="carousel slide osa-carousel galerij-carousel">
            {%- if vd_fotos.size > 1 -%}
            <div class="carousel-indicators">
              {%- for f in vd_fotos -%}
              <button type="button" data-bs-target="#{{ vd_id }}-carousel" data-bs-slide-to="{{ forloop.index0 }}"
                      {% if forloop.first %}class="active" aria-current="true"{% endif %}
                      aria-label="Foto {{ forloop.index }}"></button>
              {%- endfor -%}
            </div>
            {%- endif -%}
            <div class="carousel-inner">
              {%- for f in vd_fotos -%}
              <div class="carousel-item{% if forloop.first %} active{% endif %}">
                <img src="{{ f.path | relative_url }}" class="d-block"
                     alt="{{ e.event }} {{ vd_year }} — foto {{ forloop.index }}" loading="lazy">
              </div>
              {%- endfor -%}
            </div>
            {%- if vd_fotos.size > 1 -%}
            <button class="carousel-control-prev" type="button" data-bs-target="#{{ vd_id }}-carousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Vorige</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#{{ vd_id }}-carousel" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Volgende</span>
            </button>
            {%- endif -%}
            <div class="carousel-caption-fixed">{{ e.event }} · {{ e.date_label }}</div>
          </div>
        </div>
      </div>
    </div>
    {%- endif -%}
    {%- endfor -%}

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
