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

                        const { lightboxSrc, lightboxSrcset, lightboxSizes } = targetTrigger.dataset;
                        const src = lightboxSrc || targetTrigger.getAttribute('href');

                        if (!src) {
                                return;
                        }

                        const image = new Image();

                        if (lightboxSrcset) {
                                image.srcset = lightboxSrcset;
                                if (lightboxSizes) {
                                        image.sizes = lightboxSizes;
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

                const { lightboxSrc, lightboxSrcset, lightboxSizes, lightboxAlt, lightboxCaption } = trigger.dataset;
                const image = trigger.querySelector('img');
                const src = lightboxSrc || trigger.getAttribute('href');

                if (!src) {
                        return;
                }

                if (lightboxSrcset) {
                        imageEl.srcset = lightboxSrcset;
                        if (lightboxSizes) {
                                imageEl.sizes = lightboxSizes;
                        } else {
                                imageEl.removeAttribute('sizes');
                        }
                } else {
                        imageEl.removeAttribute('srcset');
                        imageEl.removeAttribute('sizes');
                }

                imageEl.src = src;
                imageEl.alt = lightboxAlt || (image ? image.alt : '');

                const captionContent = lightboxCaption || (image ? image.alt : '');
                setCaption(captionContent);

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

        document.addEventListener('click', (event) => {
                const trigger = event.target.closest(LIGHTBOX_SELECTOR);

                if (!trigger) {
                        return;
                }

                event.preventDefault();
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
