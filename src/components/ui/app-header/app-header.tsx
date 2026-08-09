import React, { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const { pathname } = useLocation();

  const isConstructorActive =
    pathname === '/' || pathname.startsWith('/ingredients/');
  const isFeedActive = pathname.startsWith('/feed');
  const isProfileActive = pathname.startsWith('/profile');

  const linkStyle = { textDecoration: 'none', color: 'inherit' };

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <NavLink to='/' style={linkStyle}>
            <div className={styles.link}>
              <BurgerIcon
                type={isConstructorActive ? 'primary' : 'secondary'}
              />
              <p
                className={`text text_type_main-default ml-2 mr-10 ${
                  isConstructorActive ? '' : 'text_color_inactive'
                }`}
              >
                Конструктор
              </p>
            </div>
          </NavLink>

          <NavLink to='/feed' style={linkStyle}>
            <div className={styles.link}>
              <ListIcon type={isFeedActive ? 'primary' : 'secondary'} />
              <p
                className={`text text_type_main-default ml-2 ${
                  isFeedActive ? '' : 'text_color_inactive'
                }`}
              >
                Лента заказов
              </p>
            </div>
          </NavLink>
        </div>

        <div className={styles.logo}>
          <NavLink to='/' style={linkStyle}>
            <Logo className='' />
          </NavLink>
        </div>

        <NavLink to='/profile' style={linkStyle}>
          <div className={styles.link_position_last}>
            <ProfileIcon type={isProfileActive ? 'primary' : 'secondary'} />
            <p
              className={`text text_type_main-default ml-2 ${
                isProfileActive ? '' : 'text_color_inactive'
              }`}
            >
              {userName || 'Личный кабинет'}
            </p>
          </div>
        </NavLink>
      </nav>
    </header>
  );
};
