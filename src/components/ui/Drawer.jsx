import Modal from './Modal.jsx';

export default function Drawer({ title, subtitle, onClose, children, footer }) {
  return (
    <Modal
      title={title}
      description={subtitle}
      onClose={onClose}
      footer={footer}
      bodyClassName="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6"
    >
      {children}
    </Modal>
  );
}
