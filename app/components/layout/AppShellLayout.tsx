"use client";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";
import styles from "../../page.module.scss";

type SectionNavItem = {
  slug: string;
  label: string;
  icon: ReactNode;
  defaultMenuSlug: string;
};

type TopNavItem = {
  slug: string;
  label: string;
  hasMenu?: boolean;
};

type AppShellLayoutProps = {
  isSidebarCollapsed: boolean;
  selectedCompany: string;
  isCompanyMenuOpen: boolean;
  fakeCompanies: string[];
  sectionSlug: string;
  sectionDefinitions: SectionNavItem[];
  companyButtonRef: RefObject<HTMLButtonElement | null>;
  companyMenuRef: RefObject<HTMLDivElement | null>;
  onToggleCompanyMenu: () => void;
  onCompanySelect: (company: string) => void;
  onNavigateSection: (section: string, defaultMenuSlug: string) => void;
  onToggleSidebar: () => void;
  leftTopMenuItems: TopNavItem[];
  rightTopMenuItems: TopNavItem[];
  isTopMenuItemActive: (item: TopNavItem) => boolean;
  onTopMenuClick: (item: TopNavItem, event: ReactMouseEvent<HTMLButtonElement>) => void;
  topMenuAnchorEl: HTMLElement | null;
  onCloseTopMenuDropdown: () => void;
  topMenuDropdownOptions: Array<{ slug: string; label: string }>;
  topMenuDropdownOwnerSlug: string | null;
  menuSlug: string;
  onTopMenuOptionSelect: (optionSlug: string) => void;
  currentSectionLabel: string;
  currentMenuLabel: string;
  isContractDetailOpen: boolean;
  isLineItemDetailOpen: boolean;
  selectedContractId: string | null;
  selectedLineItemId: string | null;
  isCreatingLineItem: boolean;
  onCloseContractDetail: () => void;
  onCloseLineItemDetail: () => void;
  children: ReactNode;
};

export function AppShellLayout({
  isSidebarCollapsed,
  selectedCompany,
  isCompanyMenuOpen,
  fakeCompanies,
  sectionSlug,
  sectionDefinitions,
  companyButtonRef,
  companyMenuRef,
  onToggleCompanyMenu,
  onCompanySelect,
  onNavigateSection,
  onToggleSidebar,
  leftTopMenuItems,
  rightTopMenuItems,
  isTopMenuItemActive,
  onTopMenuClick,
  topMenuAnchorEl,
  onCloseTopMenuDropdown,
  topMenuDropdownOptions,
  topMenuDropdownOwnerSlug,
  menuSlug,
  onTopMenuOptionSelect,
  currentSectionLabel,
  currentMenuLabel,
  isContractDetailOpen,
  isLineItemDetailOpen,
  selectedContractId,
  selectedLineItemId,
  isCreatingLineItem,
  onCloseContractDetail,
  onCloseLineItemDetail,
  children
}: AppShellLayoutProps) {
  return (
    <div className={styles.appShell}>
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            ref={companyButtonRef}
            className={styles.companySelectorButton}
            aria-label="BP Hissmofors Byggcor"
            onClick={onToggleCompanyMenu}
            aria-expanded={isCompanyMenuOpen}
          >
            {isSidebarCollapsed ? (
              <>
                <HomeOutlinedIcon className={styles.companySelectorHomeIcon} />
                <span className={styles.companySelectorTooltip}>{selectedCompany}</span>
              </>
            ) : (
              <>
                <span className={styles.companySelectorText}>{selectedCompany}</span>
                <KeyboardArrowDownIcon className={styles.companySelectorArrow} />
              </>
            )}
          </button>
          {isCompanyMenuOpen ? (
            <div
              className={`${styles.companyDropdown} ${
                isSidebarCollapsed ? styles.companyDropdownCollapsed : ""
              }`}
              ref={companyMenuRef}
            >
              {fakeCompanies.map((company) => (
                <button
                  key={company}
                  type="button"
                  className={`${styles.companyDropdownItem} ${
                    selectedCompany === company ? styles.companyDropdownItemActive : ""
                  }`}
                  onClick={() => onCompanySelect(company)}
                >
                  {company}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.sidebarMenu}>
          {sectionDefinitions
            .filter((section) => section.slug !== "system")
            .map((section) => (
              <button
                type="button"
                key={section.slug}
                className={`${styles.sidebarItemButton} ${
                  section.slug === sectionSlug ? styles.sidebarItemActive : ""
                }`}
                data-label={section.label}
                onClick={() => onNavigateSection(section.slug, section.defaultMenuSlug)}
              >
                <span className={styles.sidebarItemIcon}>{section.icon}</span>
                {!isSidebarCollapsed ? <span className={styles.sidebarItemText}>{section.label}</span> : null}
                {isSidebarCollapsed ? <span className={styles.sidebarItemTooltip}>{section.label}</span> : null}
              </button>
            ))}
        </div>

        <div className={styles.sidebarSpacer} />

        <div className={styles.sidebarBottomMenu}>
          {sectionDefinitions
            .filter((section) => section.slug === "system")
            .map((section) => (
              <button
                type="button"
                key={section.slug}
                className={`${styles.sidebarItemButton} ${
                  section.slug === sectionSlug ? styles.sidebarItemActive : ""
                }`}
                data-label={section.label}
                onClick={() => onNavigateSection(section.slug, section.defaultMenuSlug)}
              >
                <span className={styles.sidebarItemIcon}>{section.icon}</span>
                {!isSidebarCollapsed ? <span className={styles.sidebarItemText}>{section.label}</span> : null}
                {isSidebarCollapsed ? <span className={styles.sidebarItemTooltip}>{section.label}</span> : null}
              </button>
            ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <Avatar src="/luna-profile-avatar.png" alt="Jane Doe" variant="rounded" className={styles.userAvatar} />
            {!isSidebarCollapsed ? <Typography className={styles.userName}>Jane Doe</Typography> : null}
          </div>
        </div>
      </aside>

      <section className={styles.mainPanel}>
        <div className={styles.topNav}>
          <div className={styles.collapseButtonWrap}>
            <IconButton size="small" className={styles.collapseButton} onClick={onToggleSidebar}>
              <MenuOpenIcon />
            </IconButton>
          </div>
          {leftTopMenuItems.map((item) => (
            <Button
              key={item.slug}
              className={`${styles.topMenuItem} ${isTopMenuItemActive(item) ? styles.topMenuItemActive : ""}`}
              endIcon={item.hasMenu ? <KeyboardArrowDownIcon className={styles.menuArrowIcon} /> : undefined}
              aria-current={isTopMenuItemActive(item) ? "page" : undefined}
              onClick={(event) => onTopMenuClick(item, event)}
            >
              {item.label}
            </Button>
          ))}
          <div className={styles.topMenuSpacer} />
          <div className={styles.topMenuRightGroup}>
            {rightTopMenuItems.map((item) => (
              <Button
                key={item.slug}
                className={`${styles.topMenuItem} ${isTopMenuItemActive(item) ? styles.topMenuItemActive : ""}`}
                endIcon={<KeyboardArrowDownIcon className={styles.menuArrowIcon} />}
                aria-current={isTopMenuItemActive(item) ? "page" : undefined}
                onClick={(event) => onTopMenuClick(item, event)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <Menu
            anchorEl={topMenuAnchorEl}
            open={Boolean(topMenuAnchorEl)}
            onClose={onCloseTopMenuDropdown}
            slotProps={{ paper: { className: styles.topMenuDropdownPaper } }}
            MenuListProps={{ className: styles.topMenuDropdownList }}
          >
            {topMenuDropdownOptions.map((option) => (
              <MenuItem
                key={option.slug}
                className={`${styles.topMenuDropdownItem} ${
                  option.slug === menuSlug && topMenuDropdownOwnerSlug ? styles.topMenuDropdownItemActive : ""
                }`}
                onClick={() => onTopMenuOptionSelect(option.slug)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.breadcrumbs}>
            <Typography className={styles.breadcrumbMuted}>{currentSectionLabel}</Typography>
            <ChevronRightIcon className={styles.breadcrumbArrow} />
            {!isContractDetailOpen ? (
              <Typography className={styles.breadcrumbActive}>{currentMenuLabel}</Typography>
            ) : (
              <>
                <button type="button" className={styles.breadcrumbLinkButton} onClick={onCloseContractDetail}>
                  {currentMenuLabel}
                </button>
                <ChevronRightIcon className={styles.breadcrumbArrow} />
                {isLineItemDetailOpen ? (
                  <>
                    <button type="button" className={styles.breadcrumbLinkButton} onClick={onCloseLineItemDetail}>
                      Kontrakt {selectedContractId}
                    </button>
                    <ChevronRightIcon className={styles.breadcrumbArrow} />
                    <Typography className={styles.breadcrumbActive}>
                      {isCreatingLineItem ? "Ny kontraktsrad" : `Kontraktsrad ${selectedLineItemId}`}
                    </Typography>
                  </>
                ) : (
                  <Typography className={styles.breadcrumbActive}>Kontrakt {selectedContractId}</Typography>
                )}
              </>
            )}
          </div>

          <div className={styles.contentBody}>{children}</div>
        </div>
      </section>
    </div>
  );
}
