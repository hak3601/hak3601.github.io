---
layout: default
permalink: /timelines/
title: "Recent Updates"
author_profile: true
---

## 🚀 Recent Updates

{% include base_path %}
{% assign posts = site.posts | limit: 5 %}

{% for post in posts %}
    <div class="archive__item">
        <h2 class="archive__item-title" itemprop="headline">
            <a href="{{ post.url | relative_url }}" rel="permalink">{{ post.title }}</a>
        </h2>
        <p class="archive__item-excerpt" itemprop="description">{{ post.excerpt | strip_html | truncate: 150 }}</p>
        <span class="archive__item-date">{{ post.date | date: "%Y.%m.%d" }}</span>
    </div>
    <hr>
{% endfor %}

---

### 📚 Full Archive
<p align="center">
    <a href="{{ '/year-archive/' | relative_url }}" class="btn btn--primary">
        Show More Past Updates (Full Timeline)
    </a>
</p>