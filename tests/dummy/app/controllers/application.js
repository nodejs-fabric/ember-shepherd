import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  tour: service(),

  actions: {
    toggleHelpModal() {
      this.get('tour').set('useModalOverlay', true);
      this.get('tour').start();
    },
    toggleHelpNonmodal() {
      this.get('tour').set('useModalOverlay', false);
      this.get('tour').start();
    }
  }
});
