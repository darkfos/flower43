// Hero.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';

// Простой тест: проверяет, что компонент рендерится без ошибок
test('renders Hero component without crashing', () => {
  render(<Hero />);
  // Проверяем, что заголовок отображается
  const titleElement = screen.getByText(/Цветочная гармония для ваших моментов/i);
  expect(titleElement).toBeInTheDocument();
});

// Тест: проверяет наличие всех ключевых элементов
test('displays all main content elements', () => {
  render(<Hero />);
  
  // Проверяем заголовок
  expect(screen.getByText(/Цветочная гармония для ваших моментов/i)).toBeInTheDocument();
  
  // Проверяем подзаголовок
  expect(screen.getByText(/Свежие букеты, элегантные композиции/i)).toBeInTheDocument();
  
  // Проверяем детали с иконками
  expect(screen.getByText(/Свежие цветы ежедневно/i)).toBeInTheDocument();
  expect(screen.getByText(/Быстрая доставка/i)).toBeInTheDocument();
  expect(screen.getByText(/Индивидуальный подход/i)).toBeInTheDocument();
  
  // Проверяем кнопки
  expect(screen.getByText(/Выбрать букет/i)).toBeInTheDocument();
  expect(screen.getByText(/Смотреть композиции/i)).toBeInTheDocument();
});

// Тест: проверяет, что кнопки имеют правильные ссылки
test('buttons have correct href attributes', () => {
  render(<Hero />);
  
  const bouquetButton = screen.getByText(/Выбрать букет/i);
  expect(bouquetButton.closest('a')).toHaveAttribute('href', '#bouquets');
  
  const compositionsButton = screen.getByText(/Смотреть композиции/i);
  expect(compositionsButton.closest('a')).toHaveAttribute('href', '/compositions');
});

// Тест: проверяет наличие SVG элемента
test('renders SVG illustration', () => {
  render(<Hero />);
  
  const svgElement = document.querySelector('svg');
  expect(svgElement).toBeInTheDocument();
  expect(svgElement).toHaveAttribute('viewBox', '0 0 400 400');
});