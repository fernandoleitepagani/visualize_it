import { Fragment } from 'react';
import { Box, Flex, Text } from '@mantine/core';
import type { CatalogEntry } from '@/content/subjects';
import type { ViewKind } from '@/engine/types';
import { font, radius, vizVar } from '@/theme';

const barHeights = [9, 16, 12, 22, 15, 25];
const accent = 'var(--subject-accent, var(--viz-accent))';

/** Tiny abstract preview of a lesson's view, used on catalog cards. */
export function ViewPreview({
  view,
  kind,
}: {
  view?: ViewKind;
  kind: CatalogEntry['kind'];
}) {
  if (kind === 'theory') {
    return (
      <Box
        w={44}
        h={30}
        aria-hidden
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${vizVar.line2}`,
          borderRadius: radius.sm,
          background: vizVar.surface2,
          color: accent,
          fontSize: font.tiny,
        }}
      >
        §
      </Box>
    );
  }

  if (view === 'cells') {
    return (
      <Flex gap={3} align="center" h={30} aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            className="viz-preview-cell"
            w={9}
            h={20}
            style={{
              border: `1px solid ${i === 2 ? `color-mix(in srgb, ${accent} 34%, transparent)` : vizVar.line2}`,
              borderRadius: 4,
              background: i === 2 ? `color-mix(in srgb, ${accent} 12%, transparent)` : vizVar.surface2,
            }}
          />
        ))}
      </Flex>
    );
  }

  if (view === 'strings') {
    return (
      <Flex direction="column" gap={2} justify="center" h={30} aria-hidden>
        {[0, 1].map((row) => (
          <Flex key={row} gap={2} align="center">
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                className="viz-preview-cell"
                w={8}
                h={9}
                style={{
                  border: `1px solid ${row === 0 && i === 1 ? `color-mix(in srgb, ${accent} 34%, transparent)` : vizVar.line2}`,
                  borderRadius: 2,
                  background:
                    row === 0 && i === 1
                      ? `color-mix(in srgb, ${accent} 12%, transparent)`
                      : vizVar.surface2,
                }}
              />
            ))}
          </Flex>
        ))}
      </Flex>
    );
  }

  if (view === 'callstack') {
    return (
      <Flex
        data-testid="view-preview-callstack"
        direction="column"
        gap={2}
        justify="center"
        h={30}
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            w={26}
            h={7}
            style={{
              border: `1px solid ${i === 0 ? `color-mix(in srgb, ${accent} 34%, transparent)` : vizVar.line2}`,
              borderRadius: 2,
              background: i === 0 ? `color-mix(in srgb, ${accent} 12%, transparent)` : vizVar.surface2,
            }}
          />
        ))}
      </Flex>
    );
  }

  if (view === 'pointers') {
    return (
      <Flex
        data-testid="view-preview-pointers"
        gap={3}
        align="center"
        h={30}
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <Fragment key={i}>
            {i === 1 ? (
              <Text fz={font.micro} c="dimmed">
                →
              </Text>
            ) : null}
            <Box
              w={13}
              h={20}
              style={{
                border: `1px solid ${i === 1 ? `color-mix(in srgb, ${accent} 34%, transparent)` : vizVar.line2}`,
                borderRadius: 4,
                background:
                  i === 1 ? `color-mix(in srgb, ${accent} 12%, transparent)` : vizVar.surface2,
              }}
            />
          </Fragment>
        ))}
      </Flex>
    );
  }

  if (view === 'nodes') {
    return (
      <Flex gap={2} align="center" h={30} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Fragment key={i}>
            {i > 0 ? (
              <Text fz={font.micro} c="dimmed">
                ›
              </Text>
            ) : null}
            <Box
              className="viz-preview-node"
              w={13}
              h={20}
              style={{
                border: `1px solid ${i === 1 ? `color-mix(in srgb, ${accent} 34%, transparent)` : vizVar.line2}`,
                borderRadius: 4,
                background: i === 1 ? `color-mix(in srgb, ${accent} 12%, transparent)` : vizVar.surface2,
              }}
            />
          </Fragment>
        ))}
      </Flex>
    );
  }

  if (view === 'plot') {
    return (
      <Flex gap={3} align="flex-end" h={30} aria-hidden>
        {[8, 14, 20, 26].map((height, i) => (
          <Box
            key={i}
            className="viz-preview-bar"
            w={7}
            h={height}
            style={{
              borderRadius: '3px 3px 1px 1px',
              background: i === 3 ? accent : vizVar.surface3,
              border: `1px solid ${i === 3 ? `color-mix(in srgb, ${accent} 34%, transparent)` : vizVar.line}`,
            }}
          />
        ))}
      </Flex>
    );
  }

  if (view === 'matrix') {
    return (
      <Flex direction="column" gap={2} justify="center" h={30} aria-hidden>
        <Flex gap={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w={8}
              h={9}
              style={{
                borderRadius: 2,
                background: i === 1 ? accent : vizVar.surface2,
                border: `1px solid ${i === 1 ? accent : vizVar.line2}`,
              }}
            />
          ))}
        </Flex>
        <Flex gap={2}>
          {[3, 4, 5].map((i) => (
            <Box
              key={i}
              w={8}
              h={9}
              style={{
                borderRadius: 2,
                background: vizVar.surface2,
                border: `1px solid ${vizVar.line2}`,
              }}
            />
          ))}
        </Flex>
      </Flex>
    );
  }

  if (view === 'object') {
    return (
      <Box
        w={36}
        h={24}
        aria-hidden
        style={{
          border: `1px solid color-mix(in srgb, ${accent} 40%, ${vizVar.line2})`,
          borderRadius: 4,
          background: vizVar.surface2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          h={7}
          style={{
            background: `color-mix(in srgb, ${accent} 25%, transparent)`,
            borderBottom: `1px solid ${vizVar.line2}`,
          }}
        />
        <Flex direction="column" gap={2} p={3} justify="center" style={{ flex: 1 }}>
          <Box h={2} w={18} style={{ background: accent, borderRadius: 1 }} />
          <Box h={2} w={12} style={{ background: vizVar.line3, borderRadius: 1 }} />
        </Flex>
      </Box>
    );
  }

  if (view === 'loop') {
    return (
      <Flex gap={2} align="center" justify="center" h={30} aria-hidden>
        <Box
          w={20}
          h={20}
          style={{
            borderRadius: radius.pill,
            border: `2px solid color-mix(in srgb, ${accent} 70%, transparent)`,
            borderTopColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-45deg)',
          }}
        >
          <Box
            w={5}
            h={5}
            style={{
              borderRadius: radius.pill,
              background: accent,
            }}
          />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex gap={3} align="flex-end" h={30} aria-hidden>
      {barHeights.map((height, i) => (
        <Box
          key={i}
          className="viz-preview-bar"
          w={5}
          h={height}
          style={{
            borderRadius: '3px 3px 1px 1px',
            background: i === 5 ? accent : vizVar.line3,
          }}
        />
      ))}
    </Flex>
  );
}
