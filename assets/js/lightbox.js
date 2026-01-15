(function () {
        'use strict';

        const LIGHTBOX_SELECTOR = '.post-lightbox-trigger';
        const overlay = document.getElementById('fukasawa-lightbox');

        if (!overlay) {
                return;
        }

        const imageEl = overlay.querySelector('#fukasawa-lightbox-image');
        const captionEl = overlay.querySelector('#fukasawa-lightbox-caption');
        const closeButtons = overlay.querySelectorAll('[data-lightbox-close]');
        const prevButton = overlay.querySelector('[data-lightbox-prev]');
        const nextButton = overlay.querySelector('[data-lightbox-next]');
        const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

        let triggers = [];
        let activeIndex = -1;
        let focusableElements = [];
        let previouslyFocusedElement = null;
        let overlayIsOpen = false;
        let fetchRequestId = 0;

        const getTriggers = () => {
                triggers = Array.prototype.slice.call(document.querySelectorAll(LIGHTBOX_SELECTOR));
        };

        const removeImageSources = () => {
                imageEl.removeAttribute('src');
                imageEl.removeAttribute('srcset');
                imageEl.removeAttribute('sizes');
        };

        const setCaption = (content) => {
                if (content) {
                        captionEl.textContent = content;
                        captionEl.removeAttribute('hidden');
                        captionEl.setAttribute('aria-hidden', 'false');
                        overlay.setAttribute('aria-labelledby', 'fukasawa-lightbox-caption');
                } else {
                        captionEl.textContent = '';
                        captionEl.setAttribute('aria-hidden', 'true');
                        captionEl.setAttribute('hidden', '');
                        overlay.removeAttribute('aria-labelledby');
                }
        };

        const getNormalizedSource = (source) => {
                if (!source) {
                        return '';
                }

                return source.split('#')[0].split('?')[0];
        };

        const getSourceBasename = (source) => {
                const normalized = getNormalizedSource(source);
                return normalized.split('/').pop() || '';
        };

        const getImageSource = (image) => {
                if (!image) {
                        return '';
                }

                return image.getAttribute('data-src')
                        || image.getAttribute('data-lazy')
                        || image.getAttribute('data-original')
                        || image.getAttribute('src')
                        || '';
        };

        const getTriggerData = (trigger) => {
                if (!trigger) {
                        return null;
                }

                if (!(trigger instanceof Element)) {
                        return trigger;
                }

                const { lightboxSrc, lightboxSrcset, lightboxSizes, lightboxAlt, lightboxCaption, lightboxPermalink } = trigger.dataset;
                const image = trigger.querySelector('img');
                const src = lightboxSrc || trigger.getAttribute('href') || '';

                return {
                        src,
                        srcset: lightboxSrcset || '',
                        sizes: lightboxSizes || '',
                        alt: lightboxAlt || (image ? image.alt : ''),
                        caption: lightboxCaption || (image ? image.alt : ''),
                        permalink: lightboxPermalink || '',
                        sourceElement: trigger
                };
        };

        const preloadAdjacent = (index) => {
                if (!triggers.length) {
                        return;
                }

                const preloadOffsets = [-1, 1];

                preloadOffsets.forEach((offset) => {
                        const targetIndex = (index + triggers.length + offset) % triggers.length;
                        const targetTrigger = triggers[targetIndex];

                        if (!targetTrigger) {
                                return;
                        }

                        const data = getTriggerData(targetTrigger);
                        const src = data ? data.src : '';

                        if (!src) {
                                return;
                        }

                        const image = new Image();

                        if (data && data.srcset) {
                                image.srcset = data.srcset;
                                if (data.sizes) {
                                        image.sizes = data.sizes;
                                }
                        }

                        image.src = src;
                });
        };

        const setImage = (index) => {
                const trigger = triggers[index];

                if (!trigger) {
                        return;
                }

                const data = getTriggerData(trigger);
                const src = data ? data.src : '';

                if (!src) {
                        return;
                }

                if (data && data.srcset) {
                        imageEl.srcset = data.srcset;
                        if (data.sizes) {
                                imageEl.sizes = data.sizes;
                        } else {
                                imageEl.removeAttribute('sizes');
                        }
                } else {
                        imageEl.removeAttribute('srcset');
                        imageEl.removeAttribute('sizes');
                }

                imageEl.src = src;
                imageEl.alt = data && data.alt ? data.alt : '';

                setCaption(data && data.caption ? data.caption : '');

                activeIndex = index;
                preloadAdjacent(index);
        };

        const updateFocusableElements = () => {
                focusableElements = Array.prototype.slice.call(
                        overlay.querySelectorAll(focusableSelector)
                ).filter((element) => !element.hasAttribute('hidden'));
        };

        const openOverlay = (index, focusTarget) => {
                if (!triggers.length) {
                        getTriggers();
                }

                if (!triggers.length) {
                        return;
                }

                if (!overlayIsOpen) {
                        previouslyFocusedElement = document.activeElement;
                }

                overlayIsOpen = true;

                overlay.classList.add('is-active');
                overlay.removeAttribute('hidden');
                overlay.setAttribute('aria-hidden', 'false');
                document.body.classList.add('fukasawa-lightbox-open');

                const nextIndex = (index + triggers.length) % triggers.length;
                setImage(nextIndex);

                updateFocusableElements();

                const target = focusTarget || overlay.querySelector('[data-lightbox-close]') || overlay;

                window.requestAnimationFrame(() => {
                        if (target && typeof target.focus === 'function') {
                                target.focus();
                        }
                });
        };

        const closeOverlay = () => {
                if (!overlayIsOpen) {
                        return;
                }

                overlay.classList.remove('is-active');
                overlay.setAttribute('aria-hidden', 'true');
                overlay.setAttribute('hidden', '');
                document.body.classList.remove('fukasawa-lightbox-open');

                removeImageSources();
                setCaption('');

                overlayIsOpen = false;
                activeIndex = -1;

                const focusTarget = previouslyFocusedElement;
                previouslyFocusedElement = null;

                if (focusTarget && typeof focusTarget.focus === 'function') {
                        focusTarget.focus();
                }
        };

        const showPrevious = () => {
                if (!triggers.length) {
                        return;
                }

                const nextIndex = (activeIndex - 1 + triggers.length) % triggers.length;
                setImage(nextIndex);

                window.requestAnimationFrame(() => {
                        if (prevButton) {
                                prevButton.focus();
                        }
                });
        };

        const showNext = () => {
                if (!triggers.length) {
                        return;
                }

                const nextIndex = (activeIndex + 1) % triggers.length;
                setImage(nextIndex);

                window.requestAnimationFrame(() => {
                        if (nextButton) {
                                nextButton.focus();
                        }
                });
        };

        const getPostImages = async (permalink) => {
                if (!permalink) {
                        return [];
                }

                try {
                        const response = await fetch(permalink, { credentials: 'same-origin' });

                        if (!response.ok) {
                                return [];
                        }

                        const html = await response.text();
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const images = Array.prototype.slice.call(
                                doc.querySelectorAll('.featured-media img, .post-content img')
                        );

                        const seen = new Set();
                        const collected = [];

                        images.forEach((image) => {
                                const src = getImageSource(image);

                                if (!src) {
                                        return;
                                }

                                const normalized = getNormalizedSource(src);

                                if (seen.has(normalized)) {
                                        return;
                                }

                                seen.add(normalized);

                                const figure = image.closest('figure');
                                const caption = figure ? figure.querySelector('figcaption') : null;
                                const captionText = caption ? caption.textContent.trim() : '';

                                collected.push({
                                        src,
                                        srcset: image.getAttribute('srcset') || '',
                                        sizes: image.getAttribute('sizes') || '',
                                        alt: image.getAttribute('alt') || '',
                                        caption: captionText || image.getAttribute('alt') || ''
                                });
                        });

                        return collected;
                } catch (error) {
                        return [];
                }
        };

        const findMatchingIndex = (items, reference) => {
                if (!items.length || !reference) {
                        return -1;
                }

                const referenceSource = getNormalizedSource(reference.src);
                const referenceBasename = getSourceBasename(reference.src);

                return items.findIndex((item) => {
                        const data = getTriggerData(item);
                        const candidateSource = data ? getNormalizedSource(data.src) : '';
                        const candidateBasename = getSourceBasename(candidateSource);

                        if (!candidateSource) {
                                return false;
                        }

                        if (referenceSource && candidateSource === referenceSource) {
                                return true;
                        }

                        return referenceBasename && candidateBasename === referenceBasename;
                });
        };

        document.addEventListener('click', async (event) => {
                const trigger = event.target.closest(LIGHTBOX_SELECTOR);

                if (!trigger) {
                        return;
                }

                event.preventDefault();
                const fetchId = ++fetchRequestId;
                const triggerData = getTriggerData(trigger);
                const permalink = triggerData ? triggerData.permalink : '';

                if (permalink) {
                        const fetchedTriggers = await getPostImages(permalink);

                        if (fetchId !== fetchRequestId) {
                                return;
                        }

                        if (fetchedTriggers.length) {
                                triggers = fetchedTriggers;
                                const matchedIndex = findMatchingIndex(fetchedTriggers, triggerData);
                                const startIndex = matchedIndex === -1 ? 0 : matchedIndex;
                                openOverlay(startIndex, overlay.querySelector('[data-lightbox-close]'));
                                return;
                        }
                }

                getTriggers();

                const index = triggers.indexOf(trigger);

                if (index === -1) {
                        return;
                }

                openOverlay(index, overlay.querySelector('[data-lightbox-close]'));
        });

        closeButtons.forEach((button) => {
                button.addEventListener('click', (event) => {
                        event.preventDefault();
                        closeOverlay();
                });
        });

        overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                        closeOverlay();
                }
        });

        if (prevButton) {
                prevButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        showPrevious();
                });
        }

        if (nextButton) {
                nextButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        showNext();
                });
        }

        document.addEventListener('keydown', (event) => {
                if (!overlayIsOpen) {
                        return;
                }

                switch (event.key) {
                        case 'Escape':
                                event.preventDefault();
                                closeOverlay();
                                break;
                        case 'ArrowLeft':
                                event.preventDefault();
                                showPrevious();
                                break;
                        case 'ArrowRight':
                                event.preventDefault();
                                showNext();
                                break;
                        case 'Tab':
                                updateFocusableElements();

                                if (!focusableElements.length) {
                                        return;
                                }

                                const first = focusableElements[0];
                                const last = focusableElements[focusableElements.length - 1];

                                if (event.shiftKey) {
                                        if (document.activeElement === first) {
                                                event.preventDefault();
                                                last.focus();
                                        }
                                } else if (document.activeElement === last) {
                                        event.preventDefault();
                                        first.focus();
                                }

                                break;
                        default:
                                break;
                }
        });

        document.body.addEventListener('post-load', () => {
                getTriggers();
        });

        getTriggers();
})();
