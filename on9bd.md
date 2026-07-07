---
layout: default
title: ON9BD
permalink: /on9bd/
description: Station ON9BD aan boord van het lichtschip West-Hinder 3.
---

<section class="section">
  <div class="container">
    <div class="section-head text-center">
      <span class="section-kicker">West-Hinder 3</span>
      <h1 class="section-title">Station ON9BD</h1>
    </div>

    <div class="row justify-content-center">
      <div class="col-lg-8 text-center">
        <p class="on9bd-text">
          Aan boord van het lichtschip West-Hinder 3 bevindt zich het clubstation ON9BD.
          Dit station wordt door de leden van OSA bij verschillende gelegenheden geactiveerd en 
          is uitgerust met antennes voor zowel de HF- als de VHF-banden.
        </p>
      </div>
    </div>

    <div class="section-head text-center gallery-head">
      <span class="section-kicker">Sfeerbeelden</span>
      <h2 class="section-title">Enkele sfeerbeelden</h2>
    </div>

    {%- comment -%} Add more filenames (in /assets/img/) to grow the carousel. {%- endcomment -%}
    {%- assign gallery = "westhinder.jpg" | split: "," -%}
    <div id="on9bdCarousel" class="carousel slide carousel-fade osa-carousel"
         data-bs-ride="carousel" data-bs-interval="4000">
      {%- if gallery.size > 1 -%}
      <div class="carousel-indicators">
        {%- for img in gallery -%}
        <button type="button" data-bs-target="#on9bdCarousel" data-bs-slide-to="{{ forloop.index0 }}"
                {% if forloop.first %}class="active" aria-current="true"{% endif %}
                aria-label="Foto {{ forloop.index }}"></button>
        {%- endfor -%}
      </div>
      {%- endif -%}
      <div class="carousel-inner">
        {%- for img in gallery -%}
        <div class="carousel-item{% if forloop.first %} active{% endif %}">
          <img src="{{ '/assets/img/' | append: img | relative_url }}"
               class="d-block" alt="West-Hinder 3 · ON9BD" loading="lazy">
        </div>
        {%- endfor -%}
      </div>
      {%- if gallery.size > 1 -%}
      <button class="carousel-control-prev" type="button" data-bs-target="#on9bdCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Vorige</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#on9bdCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Volgende</span>
      </button>
      {%- endif -%}
      <div class="carousel-caption-fixed">West-Hinder 3 · ON9BD</div>
    </div>
  </div>
</section>
