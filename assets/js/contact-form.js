(function () {
        'use strict';

        const form = document.querySelector('.fukasawa-contact-form');

        if (!form) {
                return;
        }

        const slotContainer = form.querySelector('[data-availability-slots]');
        const availabilityErrorContainer = form.querySelector('[data-availability-error]');
        const addButton = form.querySelector('[data-add-slot]');
        const slotTemplate = document.getElementById('fukasawa-date-slot-template');
        const localized = window.fukasawaContactForm || {};
        const maxSlots = parseInt(form.dataset.maxSlots || localized.maxSlots || 5, 10);
        const messages = localized.errorMessages || {};
        const removeSlotLabel = localized.removeSlotLabel || 'Remove availability';
        const trackedFields = new Set();

        const getSlots = () => {
                if (!slotContainer) {
                        return [];
                }

                return Array.prototype.slice.call(slotContainer.querySelectorAll('[data-slot]'));
        };

        const generateId = () => 'contact-slot-' + Math.random().toString(36).slice(2, 9);

        const clearClientErrors = () => {
                form.querySelectorAll('[data-error-source="client"]').forEach((element) => {
                        if (element.parentElement) {
                                element.parentElement.removeChild(element);
                        }
                });

                trackedFields.forEach((field) => {
                        field.removeAttribute('aria-invalid');
                        if (field.dataset.originalDescribedby) {
                                const original = field.dataset.originalDescribedby.trim();
                                if (original) {
                                        field.setAttribute('aria-describedby', original);
                                } else {
                                        field.removeAttribute('aria-describedby');
                                }
                        } else {
                                field.removeAttribute('aria-describedby');
                        }
                });

                trackedFields.clear();

                if (availabilityErrorContainer) {
                        availabilityErrorContainer.querySelectorAll('[data-error-source="client"]').forEach((element) => {
                                element.remove();
                        });
                }
        };

        const showFieldError = (field, message) => {
                if (!field || !message) {
                        return null;
                }

                const wrapper = field.closest('.contact-form__field') || field.parentElement;
                if (!wrapper) {
                        return null;
                }

                if (!field.dataset.originalDescribedby) {
                        field.dataset.originalDescribedby = field.getAttribute('aria-describedby') || '';
                }

                const errorId = field.id ? field.id + '-error' : generateId() + '-error';
                const error = document.createElement('p');
                error.className = 'contact-form__error';
                error.dataset.errorSource = 'client';
                error.id = errorId;
                error.setAttribute('role', 'alert');
                error.textContent = message;

                wrapper.appendChild(error);

                const describedby = field.getAttribute('aria-describedby');
                field.setAttribute('aria-invalid', 'true');
                field.setAttribute('aria-describedby', describedby ? describedby + ' ' + errorId : errorId);

                trackedFields.add(field);

                return error;
        };

        const showAvailabilityError = (message) => {
                if (!availabilityErrorContainer || !message) {
                        return;
                }

                const error = document.createElement('p');
                error.className = 'contact-form__error';
                error.dataset.errorSource = 'client';
                error.id = 'contact-availability-error';
                error.setAttribute('role', 'alert');
                error.textContent = message;

                availabilityErrorContainer.appendChild(error);
        };

        const updateRemoveButtons = () => {
                const slots = getSlots();
                const disableRemoval = slots.length <= 1;

                slots.forEach((slot) => {
                        const button = slot.querySelector('[data-remove-slot]');
                        if (!button) {
                                return;
                        }

                        if (disableRemoval) {
                                button.classList.add('is-hidden');
                                button.setAttribute('tabindex', '-1');
                                button.setAttribute('aria-hidden', 'true');
                        } else {
                                button.classList.remove('is-hidden');
                                button.removeAttribute('tabindex');
                                button.setAttribute('aria-hidden', 'false');
                        }
                });

                if (addButton) {
                        if (slots.length >= maxSlots) {
                                addButton.disabled = true;
                                addButton.setAttribute('aria-disabled', 'true');
                        } else {
                                addButton.disabled = false;
                                addButton.removeAttribute('aria-disabled');
                        }
                }
        };

        const populateSlot = (slot, values) => {
                if (!slot) {
                        return;
                }

                const uniqueId = generateId();
                const dateInput = slot.querySelector('input[name="shoot_dates[]"]');
                const timeSelect = slot.querySelector('select[name="shoot_times[]"]');
                const dateLabel = slot.querySelector('label[for="contact-date-__index__"]');
                const timeLabel = slot.querySelector('label[for="contact-time-__index__"]');

                if (dateInput) {
                        if (dateInput.id) {
                                dateInput.id = dateInput.id.replace('__index__', uniqueId);
                        }
                        if (values && values.date) {
                                dateInput.value = values.date;
                        }
                }

                if (timeSelect) {
                        if (timeSelect.id) {
                                timeSelect.id = timeSelect.id.replace('__index__', uniqueId);
                        }
                        if (values && values.time) {
                                timeSelect.value = values.time;
                        }
                }

                if (dateLabel) {
                        dateLabel.setAttribute('for', dateLabel.getAttribute('for').replace('__index__', uniqueId));
                }

                if (timeLabel) {
                        timeLabel.setAttribute('for', timeLabel.getAttribute('for').replace('__index__', uniqueId));
                }

                const removeButton = slot.querySelector('[data-remove-slot]');
                if (removeButton) {
                        const srText = removeButton.querySelector('.screen-reader-text');
                        if (srText) {
                                srText.textContent = removeSlotLabel;
                        }
                }
        };

        const addSlot = (values) => {
                if (!slotTemplate || !slotContainer) {
                        return;
                }

                const content = slotTemplate.content ? slotTemplate.content.cloneNode(true) : null;
                if (!content) {
                        return;
                }

                const slot = content.querySelector('[data-slot]');
                if (!slot) {
                        return;
                }

                populateSlot(slot, values);
                slotContainer.appendChild(slot);

                updateRemoveButtons();

                const firstField = slot.querySelector('input, select, textarea');
                if (firstField && typeof firstField.focus === 'function') {
                        window.requestAnimationFrame(() => firstField.focus());
                }
        };

        const getMessage = (key, fallback) => (messages && messages[key]) ? messages[key] : fallback;

        const validateAvailability = () => {
                const slots = getSlots();
                if (!slots.length) {
                        return false;
                }

                let hasValidEntry = false;
                let hasIncompleteEntry = false;

                slots.forEach((slot) => {
                        const dateInput = slot.querySelector('input[name="shoot_dates[]"]');
                        const timeSelect = slot.querySelector('select[name="shoot_times[]"]');
                        const dateValue = dateInput ? dateInput.value.trim() : '';
                        const timeValue = timeSelect ? timeSelect.value.trim() : '';

                        if (dateValue && timeValue) {
                                hasValidEntry = true;
                        } else if (dateValue || timeValue) {
                                hasIncompleteEntry = true;
                                if (dateInput && !dateValue) {
                                        showFieldError(dateInput, getMessage('dates', 'Please provide a matching date.'));
                                }
                                if (timeSelect && !timeValue) {
                                        showFieldError(timeSelect, getMessage('dates', 'Please choose a matching time.'));
                                }
                        }
                });

                if (!hasValidEntry || hasIncompleteEntry) {
                        showAvailabilityError(getMessage('dates', 'Please provide at least one preferred date and time.'));
                        return false;
                }

                return true;
        };

        const validateForm = () => {
                clearClientErrors();

                let isValid = true;
                let firstInvalidField = null;

                const nameField = form.querySelector('[name="sender_name"]');
                if (nameField && !nameField.value.trim()) {
                        showFieldError(nameField, getMessage('sender_name', 'Please enter your name.'));
                        firstInvalidField = firstInvalidField || nameField;
                        isValid = false;
                }

                const emailField = form.querySelector('[name="sender_email"]');
                if (emailField) {
                        const value = emailField.value.trim();
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!value || !emailPattern.test(value)) {
                                showFieldError(emailField, getMessage('sender_email', 'Please enter a valid email address.'));
                                firstInvalidField = firstInvalidField || emailField;
                                isValid = false;
                        }
                }

                const typeField = form.querySelector('[name="photography_type"]');
                if (typeField && !typeField.value.trim()) {
                        showFieldError(typeField, getMessage('photography_type', 'Please select a photography type.'));
                        firstInvalidField = firstInvalidField || typeField;
                        isValid = false;
                }

                const messageField = form.querySelector('[name="message"]');
                if (messageField && !messageField.value.trim()) {
                        showFieldError(messageField, getMessage('message', 'Please share additional project details.'));
                        firstInvalidField = firstInvalidField || messageField;
                        isValid = false;
                }

                if (!validateAvailability()) {
                        if (!firstInvalidField) {
                                const firstSlotField = slotContainer ? slotContainer.querySelector('input, select') : null;
                                firstInvalidField = firstSlotField;
                        }
                        isValid = false;
                }

                if (!isValid && firstInvalidField && typeof firstInvalidField.focus === 'function') {
                        window.requestAnimationFrame(() => firstInvalidField.focus());
                }

                return isValid;
        };

        if (addButton) {
                addButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        if (getSlots().length >= maxSlots) {
                                return;
                        }

                        addSlot();
                });
        }

        if (slotContainer) {
                slotContainer.addEventListener('click', (event) => {
                        const removeButton = event.target.closest('[data-remove-slot]');
                        if (!removeButton) {
                                return;
                        }

                        event.preventDefault();

                        const slot = removeButton.closest('[data-slot]');
                        if (!slot) {
                                return;
                        }

                        if (getSlots().length <= 1) {
                                return;
                        }

                        slot.remove();
                        updateRemoveButtons();
                });
        }

        form.addEventListener('submit', (event) => {
                if (!validateForm()) {
                        event.preventDefault();
                }
        });

        updateRemoveButtons();
})();
