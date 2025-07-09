import { submitStory } from '../models/story-model.js';

export class StoryAddPresenter {
  constructor() {
    this.view = null;
  }

  setView(view) {
    this.view = view;
  }

  async onPageLoad() {
    this.view.render();
  }

  async onSubmitPhoto(photo, formData) {
    if (!photo || photo.size > 1048576) {
      this.view.renderSubmitError('Foto wajib diunggah dan harus kurang dari 1MB');
      return;
    }

    this.view.showLoadingOverlay('Mengunggah cerita...');

    try {
      await submitStory(formData);
      this.view.renderSubmitSuccess();
      this.view.navigateTo('#/stories');
    } catch (err) {
      this.view.renderSubmitError('Gagal menambahkan cerita: ' + err.message);
    } finally {
      this.view.hideLoadingOverlay();
    }
  }
}
