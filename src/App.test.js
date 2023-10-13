import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ok', () => {
  window.utools = {
    onPluginEnter: () => {},
    setExpendHeight: () => {},
  }
  render(<App />);
  const linkElement = screen.getByText(/点击选择图片/i);
  expect(linkElement).toBeInTheDocument();
});
